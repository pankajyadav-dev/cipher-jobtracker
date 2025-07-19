const Category = require('../model/category');
const InputValidationException = require('../exceptions/inputValidatorException');

const createCategory = async (req, res) => {
    try {
        const { user } = req;
        const { name, description, color, icon } = req.body;
        
        if (!name) {
            throw new InputValidationException('Category name is required');
        }
        
        const category = new Category({
            name,
            description,
            color,
            icon,
            createdBy: user._id
        });
        
        await category.save();
        return res.status(201).send(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({ message: 'Category name already exists' });
        }
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const { active, popular } = req.query;
        
        let query = {};
        if (active === 'true') {
            query.isActive = true;
        }
        
        let categories;
        if (popular === 'true') {
            categories = await Category.getPopularCategories();
        } else {
            categories = await Category.find(query)
                .populate('createdBy', 'firstname lastname email')
                .sort({ name: 1 });
        }
        
        return res.status(200).send(categories);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const category = await Category.findById(categoryId)
            .populate('createdBy', 'firstname lastname email');
        
        if (!category) {
            throw new Error('Category not found');
        }
        
        return res.status(200).send(category);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { user } = req;
        const { categoryId } = req.params;
        const { name, description, color, icon, isActive } = req.body;
        
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        
        if (category.createdBy.toString() !== user._id.toString() && user.type !== 'ADMIN') {
            throw new Error('Unauthorized to update this category');
        }
        
        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (color) updateData.color = color;
        if (icon !== undefined) updateData.icon = icon;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true, runValidators: true }
        );
        
        return res.status(200).send(updatedCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({ message: 'Category name already exists' });
        }
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { user } = req;
        const { categoryId } = req.params;
        
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        
        if (category.createdBy.toString() !== user._id.toString() && user.type !== 'ADMIN') {
            throw new Error('Unauthorized to delete this category');
        }
        
        const Job = require('../model/job');
        const jobsUsingCategory = await Job.countDocuments({ category: categoryId });
        
        if (jobsUsingCategory > 0) {
            throw new Error('Cannot delete category that is being used by jobs');
        }
        
        await Category.findByIdAndDelete(categoryId);
        return res.status(200).send({ message: 'Category deleted successfully' });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const updateCategoryJobCount = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        
        await category.updateJobCount();
        return res.status(200).send(category);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    updateCategoryJobCount
};
