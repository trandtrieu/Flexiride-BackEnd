require('dotenv').config();
const BookingCarpool = require('../models/bookingCarpool');
const Notification = require('../models/notification'); // Đảm bảo đã import NotificationSchema

exports.availableRides = async (req, res) => {
    try {
        const { start_location, end_location, date, time_start } = req.body;

        // Chuyển đổi `time_start` thành định dạng Date với thời gian
        const rideTime = new Date(`${date}T${time_start}:00`);

        // Tạo khoảng thời gian bắt đầu và kết thúc (±1 giờ)
        const lowerBoundTime = new Date(rideTime);
        lowerBoundTime.setHours(lowerBoundTime.getHours() - 1);

        const upperBoundTime = new Date(rideTime);
        upperBoundTime.setHours(upperBoundTime.getHours() + 1);

        // Tìm các chuyến xe có thời gian khớp trong khoảng ±1 giờ
        const rides = await BookingCarpool.find({
            status: 'pending',
            driver_id: null,
            start_location,
            end_location,
            date,
            time_start: {
                $gte: lowerBoundTime.toTimeString().substr(0, 5),  // Lớn hơn hoặc bằng thời gian bắt đầu
                $lte: upperBoundTime.toTimeString().substr(0, 5)   // Nhỏ hơn hoặc bằng thời gian kết thúc
            }
        })
        .populate('account_id', 'firstName lastName phoneNumber') // Thay đổi các trường để khớp với DriverSchema
        .sort({ date: 1, time_start: 1 });

        res.json(rides);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};

exports.createRequest = async (req, res) => {
    try {
        const { start_location, end_location, date, time_start, price } = req.body;

        // Kiểm tra nếu đã có yêu cầu tương tự (cùng ngày, cùng địa điểm và cùng thời gian)
        const existingRequest = await BookingCarpool.findOne({
            start_location,
            end_location,
            date,
            time_start,
            status: 'pending'  // Chỉ kiểm tra các chuyến chưa hoàn tất
        });

        if (existingRequest) {
            return res.status(400).json({
                message: 'You already have a similar pending request for this ride.',
                allowCreateNew: false
            });
        }

        // Tạo yêu cầu mới nếu không có yêu cầu trùng lặp
        const newRequest = new BookingCarpool({
            account_id: ['670e7a7c5a9d4ff0504fba4e'],  // Chuyển account_id vào mảng
            start_location,
            end_location,
            date,
            time_start,
            price,
            status: 'pending'
        });

        await newRequest.save();

        res.json({
            message: 'New booking carpool request created successfully!',
            request: newRequest,
            allowCreateNew: true
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};

exports.joinRequest = async (req, res) => {
    try {
        const request = await BookingCarpool.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'This ride is no longer available' });
        }

        // Kiểm tra xem khách hàng đã tham gia chưa
        if (request.account_id.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have already joined this ride.' });
        }

        // Thêm account_id vào mảng account_id
        request.account_id.push(req.user.id);
        
        // Cập nhật giá tiền (giả sử giá tiền được chia đều cho tất cả hành khách)
        request.price = request.price * (request.account_id.length - 1) / request.account_id.length;

        await request.save();
        res.json({
            message: 'You have successfully joined the ride!',
            request
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const request = await BookingCarpool.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'This ride is no longer available' });
        }

        // Cập nhật driver_id và trạng thái yêu cầu
        request.driver_id = req.user.id;
        request.status = 'accepted';
        await request.save();

        // Tìm tài xế để lấy thông tin tên và số điện thoại
        const driverName = req.user.firstName + ' ' + req.user.lastName; // Lấy tên tài xế từ thông tin người dùng
        const driverPhone = req.user.phoneNumber; // Lấy số điện thoại tài xế

        // Gửi thông báo cho các khách hàng đã tham gia
        const notifications = request.account_id.map(accountId => {
            return new Notification({
                title: 'Đã tìm được tài xế cho chuyến xe ghép của bạn',
                description: `Tên tài xế: ${driverName}, số điện thoại: ${driverPhone} đã nhận chuyến xe của bạn, chúc bạn có 1 chuyến đi an toàn.`,
                to: accountId // Gửi đến từng khách hàng
            });
        });

        // Lưu tất cả thông báo
        await Notification.insertMany(notifications);

        res.json(request);
    } catch (error) {
        console.error(error); // Log lỗi để kiểm tra
        res.status(500).send('Server Error');
    }
};

exports.myRides = async (req, res) => {
    try {
        // Tìm tất cả chuyến xe của người dùng, bao gồm khách hàng và tài xế
        const rides = await BookingCarpool.find({
            $or: [
                { account_id: req.user.id }, // Nếu người dùng là khách hàng
                { driver_id: req.user.id }   // Nếu người dùng là tài xế
            ]
        })
        .populate({
            path: 'account_id',
            select: 'firstName lastName phoneNumber' // Lấy chỉ tên và số điện thoại của khách hàng
        })
        .populate({
            path: 'driver_id',
            select: 'firstName lastName phoneNumber' // Lấy thông tin tài xế
        })
        .sort({ date: -1 }) // Sắp xếp theo ngày mới nhất
        .select('start_location end_location date time_start price status createdAt updatedAt'); // Chỉ lấy các trường cần thiết

        // Kiểm tra nếu không có chuyến xe nào
        if (rides.length === 0) {
            return res.status(404).json({ message: 'No rides found' });
        }

        // Chuyển đổi dữ liệu để loại bỏ account_id và chỉ lấy thông tin tài xế
        const formattedRides = rides.map(ride => ({
            _id: ride._id,
            start_location: ride.start_location,
            end_location: ride.end_location,
            date: ride.date,
            time_start: ride.time_start,
            price: ride.price,
            status: ride.status,
            createdAt: ride.createdAt,
            updatedAt: ride.updatedAt
        }));

        res.json(formattedRides); // Trả về danh sách chuyến xe
    } catch (error) {
        console.error(error); // Log lỗi để kiểm tra
        res.status(500).send('Server Error');
    }
};

exports.unJoinRequest = async (req, res) => {
    try {
        const request = await BookingCarpool.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Kiểm tra xem người dùng có trong danh sách tham gia không
        if (!request.account_id.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have not joined this ride.' });
        }

        // Lấy ngày hiện tại và thời gian bắt đầu của chuyến xe
        const currentDate = new Date();
        const rideDate = new Date(request.date);
        const timeStart = request.time_start.split(':'); // Chuyển đổi time_start thành giờ và phút
        rideDate.setHours(timeStart[0], timeStart[1], 0, 0); // Thêm thời gian xuất phát vào ngày khởi hành

        // Tính thời gian chênh lệch giữa thời gian hiện tại và thời gian bắt đầu của chuyến xe (đơn vị: giờ)
        const hoursDifference = (rideDate - currentDate) / (1000 * 60 * 60);

        // Nếu ngày khởi hành là hôm nay, thời gian còn lại <= 2 giờ và trạng thái chuyến đi là 'accepted', không cho hủy
        if (hoursDifference <= 2 && request.status === 'accepted') {
            return res.status(400).json({
                message: 'You cannot cancel the ride less than 2 hours before the start time when it is accepted.'
            });
        }

        // Nếu vượt qua các điều kiện kiểm tra, xóa người dùng khỏi danh sách account_id
        request.account_id = request.account_id.filter(id => id.toString() !== req.user.id);

        // Nếu không còn ai trong danh sách account_id, xóa luôn record BookingCarpool
        if (request.account_id.length === 0) {
            await BookingCarpool.findByIdAndDelete(req.params.requestId);
            return res.json({ message: 'You have successfully canceled your participation, and the ride has been deleted as there are no participants left.' });
        }

        await request.save();

        res.json({
            message: 'You have successfully canceled your participation in the ride.',
            request
        });
    } catch (error) {
        console.error(error); // Log lỗi để kiểm tra
        res.status(500).send('Server Error');
    }
};

exports.getDriverRides = async (req, res) => {
    try {
        // Tìm tất cả chuyến xe mà tài xế đã nhận (status 'accepted' hoặc khác)
        const rides = await BookingCarpool.find({
            driver_id: req.user.id, // Chỉ chuyến xe mà tài xế này đã nhận
            status: { $in: ['accepted', 'ongoing', 'completed'] } // Các trạng thái liên quan đến chuyến xe đang diễn ra hoặc hoàn tất
        })
        .populate({
            path: 'account_id',
            select: 'firstName lastName phoneNumber' // Lấy thông tin khách hàng
        })
        .select('start_location end_location date time_start price status account_id') // Chọn các trường cần thiết
        .sort({ date: -1 }); // Sắp xếp theo ngày gần nhất

        // Kiểm tra nếu tài xế chưa nhận chuyến nào
        if (rides.length === 0) {
            return res.status(404).json({ message: 'You have not accepted any rides.' });
        }

        res.json(rides); // Trả về danh sách chuyến xe mà tài xế đã nhận
    } catch (error) {
        console.error(error); // Log lỗi để kiểm tra
        res.status(500).send('Server Error');
    }
};

exports.updateRideStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['ongoing', 'completed'];

        // Kiểm tra xem status được yêu cầu có hợp lệ không
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status update.' });
        }

        const ride = await BookingCarpool.findById(req.params.rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Kiểm tra xem tài xế có quyền cập nhật chuyến này không
        if (ride.driver_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this ride.' });
        }

        // Cập nhật trạng thái chuyến đi
        ride.status = status;
        await ride.save();

        // Trả về chuyến đi đã cập nhật
        res.json({
            message: `Ride status updated to ${status}`,
            ride
        });
    } catch (error) {
        console.error(error); // Log lỗi để kiểm tra
        res.status(500).send('Server Error');
    }
};

exports.updatePickupProgress = async (req, res) => {
    try {
        const { rideId, customerId } = req.params;

        // Tìm chuyến đi
        const ride = await BookingCarpool.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        console.log("=================CHeck========================")

        console.log(ride.driver_id.toString())
        console.log(req.user.id)

        // Kiểm tra xem tài xế có phải là người nhận chuyến đi này không
        if (ride.driver_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this ride.' });
        }
        console.log("=================Pass========================")

        // Kiểm tra xem khách hàng có trong chuyến đi không
        const customerIndex = ride.account_id.findIndex(accountId => accountId.toString() === customerId);
        if (customerIndex === -1) {
            return res.status(404).json({ message: 'Customer not found in this ride.' });
        }

        // Cập nhật trạng thái đón khách (giả sử chúng ta lưu trạng thái này trong một mảng hoặc đối tượng)
        if (!ride.pickupStatus) {
            ride.pickupStatus = [];
        }

        const alreadyPickedUp = ride.pickupStatus.find(status => status.customerId.toString() === customerId);

        if (alreadyPickedUp) {
            return res.status(400).json({ message: 'This customer has already been picked up.' });
        }

        // Đánh dấu khách hàng đã được đón
        ride.pickupStatus.push({ customerId, pickedUp: true });

        await ride.save();

        res.json({
            message: 'Customer pickup status updated successfully.',
            ride
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
