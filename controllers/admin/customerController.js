const User = require("../../models/userSchema")
const mongoose = require("mongoose");

const customerInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search.trim();
        }

        let page = parseInt(req.query.page) || 1;
        const limit = 9;

        // Fetch filtered customer data
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        // Format the join date
        const formattedUserData = userData.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            date: user.createdOn.toLocaleDateString("en-US"), 
            isBlocked: user.isBlocked,
        }));

        const count = await User.countDocuments({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        res.render("customer-manegment", {
            data: formattedUserData, 
            totalPages,
            currentPage: page,
            search
        });
    } catch (error) {
        console.error("Error fetching customer data:", error);
        res.status(500).send("Server Error");
    }
};


const customerBlocked = async (req, res) => {
    try {
        let id = req.query.id; // Correct the query parameter
        await User.updateOne({ _id: id }, { $set: { isBlocked: true } }); // Set isBlocked to true
        res.redirect("/admin/users"); // Redirect to the correct path
    } catch (error) {
        console.error("Error blocking customer:", error.message);
        res.redirect("/pageerror");
    }
};

const uncustomerBlocked = async (req, res) => {
    try {
        let id = req.query.id; // Correct the query parameter
        await User.updateOne({ _id: id }, { $set: { isBlocked: false } }); // Set isBlocked to false
        res.redirect("/admin/users"); // Redirect to the correct path
    } catch (error) {
        console.error("Error unblocking customer:", error.message);
        res.redirect("/pageerror");
    }
};




const customerdetail = async (req, res) => {
    try {
        const userId = req.query.id;
        console.log("Received User ID:", userId);
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.error("Invalid or missing User ID");
            return res.redirect("/admin/users");
        }
        const user = await User.findById(userId);
        console.log("Fetched User:", user);

        if (!user) {
            console.error("User not found");
            return res.redirect("/admin/users");
        }
        res.render("customerdetails", { user });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.redirect("/pageerror");
    }
};


module.exports = {
    customerInfo,
    customerBlocked,
    uncustomerBlocked,
    customerdetail,
    
}