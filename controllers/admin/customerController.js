const User = require("../../models/userSchema")


const customerInfo = async (req, res) => {
    try {
        // Handle search query
        let search = "";
        if (req.query.search) {
            search = req.query.search.trim();
        }

        // Handle pagination (default to page 1)
        let page = parseInt(req.query.page) || 1;
        const limit = 9; // Limit of items per page

        // Fetch filtered customer data
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } }, // Case-insensitive search
                { email: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        })
            .limit(limit) // Limit the number of results per page
            .skip((page - 1) * limit) // Skip results based on current page
            .exec();

        // Count total matching documents (for pagination)
        const count = await User.countDocuments({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        });

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);

        // Render the EJS view with all required data
        res.render("customer-manegment", {
            data: userData,         // Pass customer data to the view
            totalPages,             // Total number of pages
            currentPage: page,      // Current page number
            search                  // Current search query
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


module.exports = {
    customerInfo,
    customerBlocked,
    uncustomerBlocked
}