const { model, Schema } = require('mongoose');

const JobSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    company: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
        required: true
    },
    workMode: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'],
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 30
    }],
    salary: {
        min: {
            type: Number,
            min: 0
        },
        max: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            enum: ['INR', 'RS'],
            default: 'INR'
        }
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 5000
    },
    requirements: [{
        type: String,
        trim: true,
        maxlength: 500
    }],
    benefits: [{
        type: String,
        trim: true,
        maxlength: 500
    }],
    skills: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    applicationDeadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Closed', 'Filled'],
        default: 'Draft'
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [{
        applicant: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Hired'],
            default: 'Applied'
        },
        coverLetter: {
            type: String,
            maxlength: 2000
        },
        resume: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        }
    }],
    viewCount: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
JobSchema.index({ title: 'text', company: 'text', description: 'text' });
JobSchema.index({ location: 1, jobType: 1, workMode: 1 });
JobSchema.index({ postedBy: 1 });
JobSchema.index({ status: 1 });

JobSchema.virtual('applicationCount').get(function () {
    return this.applications.length;
});

JobSchema.methods.applyForJob = async function (userId, coverLetter, resume) {
    const existingApplication = this.applications.find(app =>
        app.applicant.toString() === userId.toString()
    );

    if (existingApplication) {
        throw new Error('You have already applied for this job');
    }

    this.applications.push({
        applicant: userId,
        coverLetter,
        resume
    });

    await this.save();
    return this;
};

JobSchema.methods.updateApplicationStatus = async function (applicationId, status) {
    const application = this.applications.id(applicationId);
    if (!application) {
        throw new Error('Application not found');
    }

    application.status = status;
    await this.save();
    return this;
};

JobSchema.statics.findJobsWithFilters = async function (filters, skip = 0, limit = 10) {
    const query = { status: 'Published' };

    if (filters.search) {
        query.$text = { $search: filters.search };
    }

    if (filters.location) {
        query.location = new RegExp(filters.location, 'i');
    }

    if (filters.jobType) {
        query.jobType = filters.jobType;
    }

    if (filters.workMode) {
        query.workMode = filters.workMode;
    }

    if (filters.company) {
        query.company = new RegExp(filters.company, 'i');
    }

    if (filters.minSalary || filters.maxSalary) {
        query['salary.min'] = {};
        if (filters.minSalary) query['salary.min'].$gte = filters.minSalary;
        if (filters.maxSalary) query['salary.max'].$lte = filters.maxSalary;
    }

    return await this.find(query)
        .populate('postedBy', 'firstname lastname email')
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

const Job = model('Job', JobSchema);
module.exports = Job;
