
const User = require('../model/user');
const InputValidationException = require('../exceptions/inputValidatorException');
const { encryptPassword } = require('../bcrypt');

const getProfile = async (req, res) => {
    try {
        const { user } = req;
        
        const profile = await User.findById(user._id)
            .select('-password -tokens')
            .lean();
        
        if (!profile) {
            throw new Error('Profile not found');
        }
        
        return res.status(200).send({ profile });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};
const uploadResume = async (req, res) => {
    try {
        const { user } = req;
        const file = req.file;
        
        if (!file) {
            throw new Error('Resume file is required');
        }

        // Convert file buffer to base64 for storage
        const resumeData = {
            name: file.originalname,
            data: file.buffer.toString('base64'),
            contentType: file.mimetype,
            size: file.size,
            uploadedAt: new Date()
        };
        
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { resume: resumeData },
            { new: true, runValidators: true }
        ).select('-password -tokens');

        return res.status(200).send({ 
            message: 'Resume uploaded successfully',
            user: updatedUser,
            resume: {
                name: resumeData.name,
                size: resumeData.size,
                url: `/api/profile/resume/download`
            }
        });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};


const updateProfile = async (req, res) => {
    try {
        const { user } = req;
        const { firstname, lastname, email, phone, location, bio, skills, experience, education } = req.body;
        
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) {
                throw new Error('Email already exists');
            }
        }
        
        const updateData = {};
        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (location) updateData.location = location;
        if (bio) updateData.bio = bio;
        if (skills) updateData.skills = skills;
        if (experience) updateData.experience = experience;
        if (education) updateData.education = education;
        
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -tokens');
        
        return res.status(200).send({ 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { user } = req;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            throw new Error('Current password and new password are required');
        }
        
        const { checkPasswords } = require('../bcrypt');
        const isMatch = await checkPasswords(currentPassword, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }
        
        user.password = newPassword;
        await user.save();
        
        return res.status(200).send({ message: 'Password changed successfully' });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const { user } = req;
        const { password } = req.body;
        
        if (!password) {
            throw new Error('Password is required to delete account');
        }
        
        const { checkPasswords } = require('../bcrypt');
        const isMatch = await checkPasswords(password, user.password);
        if (!isMatch) {
            throw new Error('Password is incorrect');
        }
        if (user.type === 'ADMIN') {
            const Job = require('../model/job');
            const activeJobs = await Job.countDocuments({ 
                postedBy: user._id, 
                status: { $in: ['Published', 'Draft'] } 
            });
            
            if (activeJobs > 0) {
                throw new Error('Cannot delete account. Please close or delete all active job postings first.');
            }
        }
        
        await User.findByIdAndDelete(user._id);
        
        return res.status(200).send({ message: 'Account deleted successfully' });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const profile = await User.findById(userId)
            .select('firstname lastname email bio skills experience education location createdAt')
            .lean();
        
        if (!profile) {
            throw new Error('Profile not found');
        }
        
        return res.status(200).send({ profile });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const uploadProfilePicture = async (req, res) => {
    try {
        const { user } = req;
        const { profilePicture } = req.body;
        
        if (!profilePicture) {
            throw new Error('Profile picture is required');
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { profilePicture },
            { new: true, runValidators: true }
        ).select('-password -tokens');
        
        return res.status(200).send({ 
            message: 'Profile picture updated successfully',
            user: updatedUser 
        });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const deleteResume = async (req, res) => {
    try {
        const { user } = req;
        
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $unset: { resume: 1 } },
            { new: true, runValidators: true }
        ).select('-password -tokens');

        return res.status(200).send({ 
            message: 'Resume deleted successfully',
            user: updatedUser 
        });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const downloadResume = async (req, res) => {
    try {
        const { user } = req;
        
        // Fetch user with resume data
        const userWithResume = await User.findById(user._id).select('resume');
        
        if (!userWithResume || !userWithResume.resume || !userWithResume.resume.data) {
            return res.status(404).send({ message: 'No resume found' });
        }

        const resumeBuffer = Buffer.from(userWithResume.resume.data, 'base64');
        
        res.set({
            'Content-Type': userWithResume.resume.contentType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${userWithResume.resume.name || 'resume.pdf'}"`,
            'Content-Length': resumeBuffer.length
        });
        
        return res.send(resumeBuffer);
    } catch (error) {
        console.error('Resume download error:', error);
        return res.status(500).send({ message: 'Failed to download resume' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    getPublicProfile,
    uploadProfilePicture,
    uploadResume,
    deleteResume,
    downloadResume
};
