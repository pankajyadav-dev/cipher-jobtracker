const Job = require('../model/job');
const User = require('../model/user');
const InputValidationException = require('../exceptions/inputValidatorException');
const mongoose = require('mongoose');

const getDashboardStats = async (req, res) => {
    try {
        const { user } = req;
        console.log('Dashboard stats requested for user:', user._id, 'Type:', user.type);
        
        if (user.type === 'ADMIN') {
            const stats = await getEmployerDashboardStats(user._id);
            console.log('Admin stats generated:', stats);
            return res.status(200).send(stats);
        } else {
            const stats = await getUserDashboardStats(user._id);
            console.log('User stats generated:', stats);
            return res.status(200).send(stats);
        }
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getEmployerDashboardStats = async (userId) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        const totalJobs = await Job.countDocuments({ postedBy: userObjectId });
        const publishedJobs = await Job.countDocuments({ postedBy: userObjectId, status: 'Published' });
        const draftJobs = await Job.countDocuments({ postedBy: userObjectId, status: 'Draft' });
        const closedJobs = await Job.countDocuments({ postedBy: userObjectId, status: 'Closed' });
        const filledJobs = await Job.countDocuments({ postedBy: userObjectId, status: 'Filled' });
        
        const applicationStats = await Job.aggregate([
            { $match: { postedBy: userObjectId } },
            { $unwind: '$applications' },
            {
                $group: {
                    _id: '$applications.status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const recentApplications = await Job.aggregate([
            { $match: { postedBy: userObjectId } },
            { $unwind: '$applications' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'applications.applicant',
                    foreignField: '_id',
                    as: 'applicantInfo'
                }
            },
            {
                $project: {
                    title: 1,
                    company: 1,
                    application: '$applications',
                    applicant: { $arrayElemAt: ['$applicantInfo', 0] }
                }
            },
            { $sort: { 'application.appliedAt': -1 } },
            { $limit: 10 }
        ]);
        
        const jobPerformance = await Job.aggregate([
            { $match: { postedBy: userObjectId } },
            {
                $project: {
                    title: 1,
                    company: 1,
                    viewCount: 1,
                    applicationCount: { $size: '$applications' },
                    status: 1,
                    createdAt: 1
                }
            },
            { $sort: { viewCount: -1 } },
            { $limit: 5 }
        ]);
        
        return {
            overview: {
                totalJobs,
                publishedJobs,
                draftJobs,
                closedJobs,
                filledJobs,
                totalApplications: applicationStats.reduce((sum, stat) => sum + stat.count, 0)
            },
            applicationStats,
            recentApplications,
            topPerformingJobs: jobPerformance
        };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const getUserDashboardStats = async (userId) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('Getting user dashboard stats for:', userObjectId);
        
        const jobsWithApplications = await Job.find({ 'applications.applicant': userObjectId })
            .populate('applications.applicant', 'firstname lastname email')
            .populate('postedBy', 'firstname lastname email');
        
        console.log('Jobs with applications found:', jobsWithApplications.length);
        
        const userApplications = [];
        let statusCounts = {
            applied: 0,
            under_review: 0,
            shortlisted: 0,
            rejected: 0,
            hired: 0
        };
        
        jobsWithApplications.forEach(job => {
            const userApp = job.applications.find(app => app.applicant._id.toString() === userObjectId.toString());
            if (userApp) {
                userApplications.push({
                    job: {
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        jobType: job.jobType,
                        workMode: job.workMode
                    },
                    application: userApp
                });
                
                const statusKey = userApp.status.toLowerCase().replace(/\s+/g, '_');
                if (statusCounts.hasOwnProperty(statusKey)) {
                    statusCounts[statusKey]++;
                }
            }
        });
        
        const totalApplications = userApplications.length;
        console.log('Total applications found:', totalApplications);
        console.log('Status counts:', statusCounts);
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentApplicationsTrends = userApplications.filter(app => 
            new Date(app.application.appliedAt) >= thirtyDaysAgo
        );
        
        const applicationTrends = [];
        const trendMap = {};
        
        recentApplicationsTrends.forEach(app => {
            const date = new Date(app.application.appliedAt);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            
            if (!trendMap[key]) {
                trendMap[key] = {
                    _id: {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: date.getDate()
                    },
                    count: 0
                };
            }
            trendMap[key].count++;
        });
        
        Object.values(trendMap).forEach(trend => {
            applicationTrends.push(trend);
        });
        
        applicationTrends.sort((a, b) => {
            const dateA = new Date(a._id.year, a._id.month - 1, a._id.day);
            const dateB = new Date(b._id.year, b._id.month - 1, b._id.day);
            return dateA - dateB;
        });
        
        const recentApplications = userApplications
            .sort((a, b) => new Date(b.application.appliedAt) - new Date(a.application.appliedAt))
            .slice(0, 10);
        
        console.log('Final status counts:', statusCounts);
        console.log('Recent applications:', recentApplications.length);
        console.log('Application trends:', applicationTrends.length);
        
        return {
            overview: {
                totalApplications,
                applicationStats: statusCounts
            },
            recentApplications: recentApplications || [],
            applicationTrends: applicationTrends || []
        };
    } catch (error) {
        throw new InputValidationException(error.message);
    }
};

const getJobAnalytics = async (req, res) => {
    try {
        const { user } = req;
        const { jobId } = req.params;
        
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        
        if (user.type === 'ADMIN' && job.postedBy.toString() !== user._id.toString()) {
            throw new Error('Unauthorized to view this job analytics');
        }
        
        const analytics = await Job.aggregate([
            { $match: { _id: job._id } },
            {
                $project: {
                    title: 1,
                    company: 1,
                    viewCount: 1,
                    applicationCount: { $size: '$applications' },
                    applications: 1,
                    createdAt: 1,
                    status: 1
                }
            }
        ]);
        
        const applicationTimeline = await Job.aggregate([
            { $match: { _id: job._id } },
            { $unwind: '$applications' },
            {
                $group: {
                    _id: {
                        year: { $year: '$applications.appliedAt' },
                        month: { $month: '$applications.appliedAt' },
                        day: { $dayOfMonth: '$applications.appliedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        
        return res.status(200).send({
            job: analytics[0],
            applicationTimeline
        });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getJobAnalytics
};
