const { model, Schema } = require('mongoose');

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 2,
        maxlength: 50
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    color: {
        type: String,
        trim: true,
        default: '#007bff'
    },
    icon: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    jobCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

CategorySchema.virtual('jobs', {
    ref: 'Job',
    localField: '_id',
    foreignField: 'category'
});

CategorySchema.methods.updateJobCount = async function() {
    const Job = require('./job');
    const count = await Job.countDocuments({ category: this._id, status: 'Published' });
    this.jobCount = count;
    await this.save();
    return this;
};

CategorySchema.statics.getPopularCategories = async function(limit = 10) {
    return await this.find({ isActive: true })
        .sort({ jobCount: -1 })
        .limit(limit);
};

const Category = model('Category', CategorySchema);
module.exports = Category;
