const jobService = require('../service/jobservice');
const InputValidationException = require('../exceptions/inputValidatorException');

const createJob = async (req, res) => {
    try {
        const { user } = req;
        const jobData = req.body;
        
        const requiredFields = ['title', 'company', 'location', 'jobType', 'workMode', 'description', 'applicationDeadline'];
        for (const field of requiredFields) {
            if (!jobData[field]) {
                throw new InputValidationException(`${field} is required`);
            }
        }
        
        if (!jobData.category) {
            const Category = require('../model/category');
            let defaultCategory = await Category.findOne({ name: 'General' });
            if (!defaultCategory) {
                defaultCategory = new Category({
                    name: 'General',
                    description: 'General job category',
                    createdBy: user._id
                });
                await defaultCategory.save();
            }
            jobData.category = defaultCategory._id;
        }
        
        const job = await jobService.createJob(jobData, user._id);
        return res.status(201).send(job);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const { user } = req;
        const { jobId } = req.params;
        const updateData = req.body;
        
        const job = await jobService.updateJob(jobId, updateData, user._id);
        return res.status(200).send(job);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const { user } = req;
        const { jobId } = req.params;
        
        const result = await jobService.deleteJob(jobId, user._id);
        return res.status(200).send(result);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await jobService.getJobById(jobId);
        return res.status(200).send(job);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getJobs = async (req, res) => {
    try {
        const { 
            search, 
            location, 
            jobType, 
            workMode, 
            company, 
            minSalary, 
            maxSalary, 
            page = 1, 
            limit = 10 
        } = req.query;
        
        const filters = {
            search,
            location,
            jobType,
            workMode,
            company,
            minSalary: minSalary ? parseInt(minSalary) : undefined,
            maxSalary: maxSalary ? parseInt(maxSalary) : undefined
        };
        
        const result = await jobService.getJobs(filters, parseInt(page), parseInt(limit));
        return res.status(200).send(result);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getUserJobs = async (req, res) => {
    try {
        const { user } = req;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await jobService.getUserJobs(user._id, parseInt(page), parseInt(limit));
        return res.status(200).send(result);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const applyForJob = async (req, res) => {
    try {
        const { user } = req;
        const { jobId } = req.params;
        const applicationData = req.body;
        
        const result = await jobService.applyForJob(jobId, user._id, applicationData);
        return res.status(200).send(result);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getUserApplications = async (req, res) => {
    try {
        const { user } = req;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await jobService.getUserApplications(user._id, parseInt(page), parseInt(limit));
        return res.status(200).send(result);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { user } = req;
        const { jobId, applicationId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            throw new InputValidationException('Status is required');
        }
        
        const result = await jobService.updateApplicationStatus(jobId, applicationId, status, user._id);
        return res.status(200).send(result);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getJobApplications = async (req, res) => {
    try {
        const { user } = req;
        const { jobId } = req.params;
        
        const result = await jobService.getJobApplications(jobId, user._id);
        return res.status(200).send(result);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getJobStatistics = async (req, res) => {
    try {
        const { user } = req;
        const stats = await jobService.getJobStatistics(user._id);
        return res.status(200).send(stats);
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
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
