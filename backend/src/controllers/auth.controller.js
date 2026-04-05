const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { getJwtSecret } = require('../middlewares/auth');

// @desc    Register new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'customer',
            status: 'pending'
        });

        console.log('User created successfully in DB:', user.id);
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, status: user.status },
            getJwtSecret(),
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Inscription réussie',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l’inscription' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Check status
        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Votre compte est en attente de validation par un administrateur.' });
        }
        if (user.status === 'suspended') {
            return res.status(403).json({ message: 'Votre compte a été suspendu. Veuillez contacter le support.' });
        }

        // Update lastLogin
        await user.update({ lastLogin: new Date() });

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, status: user.status },
            getJwtSecret(),
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Update current user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const { firstName, lastName, phone, address, city, district } = req.body;

        await user.update({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            phone: phone || user.phone,
            address: address || user.address,
            city: city || user.city,
            district: district || user.district
        });

        // Return updated user without password
        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete current user account
// @route   DELETE /api/auth/profile
exports.deleteProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        await user.destroy();
        res.json({ message: 'Compte supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
