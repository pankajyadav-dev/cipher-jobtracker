const Job = require('../model/job');
const InputValidationException = require('../exceptions/inputValidatorException');

const createJob = async (jobData, userId) => {
    try {
        const job = new Job({
            ...jobData,
            postedBy: userId
        });
        await job.save();
        return job;
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const updateJob = async (jobId, updateData, userId) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        
        if (job.postedBy.toString() !== userId.toString()) {
            throw new Error('Unauthorized to update this job');
        }
        
        Object.assign(job, updateData);
        await job.save();
        return job;
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const deleteJob = async (jobId, userId) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        
        if (job.postedBy.toString() !== userId.toString()) {
            throw new Error('Unauthorized to delete this job');
        }
        
        await Job.findByIdAndDelete(jobId);
        return { message: 'Job deleted successfully' };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const getJobById = async (jobId) => {
    try {
        const job = await Job.findById(jobId)
            .populate('postedBy', 'firstname lastname email')
            .populate('applications.applicant', 'firstname lastname email');
        
        if (!job) {
            throw new Error('Job not found');
        }
        
        job.viewCount += 1;
        await job.save();
        
        return job;
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const getJobs = async (filters, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const jobs = await Job.findJobsWithFilters(filters, skip, limit);
        
        const totalJobs = await Job.countDocuments({ status: 'Published' });
        const totalPages = Math.ceil(totalJobs / limit);
        
        return {
            jobs,
            pagination: {
                currentPage: page,
                totalPages,
                totalJobs,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const getUserJobs = async (userId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const jobs = await Job.find({ postedBy: userId })
            .populate('postedBy', 'firstname lastname email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalJobs = await Job.countDocuments({ postedBy: userId });
        const totalPages = Math.ceil(totalJobs / limit);
        
        return {
            jobs,
            pagination: {
                currentPage: page,
                totalPages,
                totalJobs,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const applyForJob = async (jobId, userId, applicationData) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        
        if (job.status !== 'Published') {
            throw new Error('Job is not available for applications');
        }
        
        if (new Date() > job.applicationDeadline) {
            throw new Error('Application deadline has passed');
        }
        
        if (job.postedBy.toString() === userId.toString()) {
            throw new Error('You cannot apply to your own job');
        }
        
        await job.applyForJob(userId, applicationData.coverLetter, applicationData.resume);
        
        return { message: 'Application submitted successfully' };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const getUserApplications = async (userId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        
        const jobs = await Job.find({ 
            'applications.applicant': userId 
        })
        .populate('postedBy', 'firstname lastname email')
        .sort({ 'applications.appliedAt': -1 })
        .skip(skip)
        .limit(limit);
        
        const applications = jobs.map(job => {
            const application = job.applications.find(app => 
                app.applicant.toString() === userId.toString()
            );
            return {
                job: {
                    _id: job._id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    jobType: job.jobType,
                    workMode: job.workMode,
                    postedBy: job.postedBy
                },
                application
            };
        });
        
        const totalApplications = await Job.countDocuments({ 
            'applications.applicant': userId 
        });
        const totalPages = Math.ceil(totalApplications / limit);
        
        return {
            applications,
            pagination: {
                currentPage: page,
                totalPages,
                totalApplications,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const updateApplicationStatus = async (jobId, applicationId, status, userId) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        if (job.postedBy.toString() !== userId.toString()) {
            throw new Error('Unauthorized to update application status');
        }
        
        await job.updateApplicationStatus(applicationId, status);
        
        return { message: 'Application status updated successfully' };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const getJobApplications = async (jobId, userId) => {
    try {
        const job = await Job.findById(jobId)
            .populate('applications.applicant', 'firstname lastname email')
            .populate('postedBy', 'firstname lastname email');
        
        if (!job) {
            throw new Error('Job not found');
        }
    
        if (job.postedBy._id.toString() !== userId.toString()) {
            throw new Error('Unauthorized to view job applications');
        }
        
        return {
            job: {
                _id: job._id,
                title: job.title,
                company: job.company,
                location: job.location,
                postedBy: job.postedBy
            },
            applications: job.applications
        };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const getJobStatistics = async (userId) => {
    try {
        const totalJobs = await Job.countDocuments({ postedBy: userId });
        const publishedJobs = await Job.countDocuments({ postedBy: userId, status: 'Published' });
        const draftJobs = await Job.countDocuments({ postedBy: userId, status: 'Draft' });
        const closedJobs = await Job.countDocuments({ postedBy: userId, status: 'Closed' });
        
        const totalApplications = await Job.aggregate([
            { $match: { postedBy: userId } },
            { $project: { applicationCount: { $size: '$applications' } } },
            { $group: { _id: null, total: { $sum: '$applicationCount' } } }
        ]);
        
        return {
            totalJobs,
            publishedJobs,
            draftJobs,
            closedJobs,
            totalApplications: totalApplications[0]?.total || 0
        };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

module.exports = {
    createJob,
    updateJob,
    deleteJob,
    getJobById,
    getJobs,
    getUserJobs,
    applyForJob,
    getUserApplications,
    updateApplicationStatus,
    getJobApplications,
    getJobStatistics
};
