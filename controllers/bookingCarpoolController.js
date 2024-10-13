require('dotenv').config();
const BookingCarpool = require('../models/bookingCarpool');


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
        .populate('account_id', 'name phone')
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
            account_id: [req.user.id],  // Chuyển account_id vào mảng
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
        console.log("=======================================================================")
        console.log(req.user.id);
        console.log("=======================================================================")
        
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
        const driverName = req.user.name; // Giả sử bạn có trường name trong req.user
        const driverPhone = req.user.phone; // Giả sử bạn có trường phone trong req.user

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
            select: 'name phone' // Lấy chỉ tên và số điện thoại của khách hàng
        })
        .populate({
            path: 'driver_id',
            select: 'name phone vehicle_info' // Lấy thông tin tài xế
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

