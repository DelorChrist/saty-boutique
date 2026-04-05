const { User, Order } = require('../models');

const isDevelopment = process.env.NODE_ENV !== 'production';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Admin
exports.getAllCustomers = async (req, res, next) => {
    try {
        const customers = await User.findAll({
            where: { role: 'customer' },
            attributes: { exclude: ['password'] },
            include: [{
                model: Order,
                attributes: ['id']
            }],
            order: [['createdAt', 'DESC']]
        });

        // Add order count to each customer object
        const customersWithOrderCount = customers.map(customer => {
            const customerJSON = customer.toJSON();
            customerJSON.orderCount = customer.Orders ? customer.Orders.length : 0;
            delete customerJSON.Orders;
            return customerJSON;
        });

        res.json(customersWithOrderCount);
    } catch (error) {
        next(error);
    }
};

// @desc    Get customer details
// @route   GET /api/customers/:id
// @access  Admin
exports.getCustomerById = async (req, res, next) => {
    try {
        const customer = await User.findByPk(req.params.id, {
            where: { role: 'customer' },
            attributes: { exclude: ['password'] },
            include: [{
                model: Order,
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!customer) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        res.json(customer);
    } catch (error) {
        next(error);
    }
};

// @desc    Update customer status
// @route   PUT /api/customers/:id/status
// @access  Admin
exports.updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['pending', 'active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const customer = await User.findByPk(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        await customer.update({ status });
        res.json({ message: `Le statut du client a été mis à jour : ${status}`, customer });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Admin
exports.deleteCustomer = async (req, res, next) => {
    try {
        const customer = await User.findByPk(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        await customer.destroy();
        res.json({ message: 'Client supprimé avec succès' });
    } catch (error) {
        next(error);
    }
};
