const Job = require('../model/job');
const Category = require('../model/category');
const InputValidationException = require('../exceptions/inputValidatorException');

const searchJobs = async (req, res) => {
    try {
        const {
            q, 
            category,
            location,
            jobType,
            workMode,
            company,
            minSalary,
            maxSalary,
            skills,
            tags,
            datePosted, 
            sortBy = 'relevance',
            page = 1,
            limit = 10
        } = req.query;
        
        const query = { status: 'Published' };
        const skip = (page - 1) * limit;
        
        if (req.user && req.user._id) {
            query.postedBy = { $ne: req.user._id };
        }
        
        if (q) {
            query.$text = { $search: q };
        }
        if (category) {
            query.category = category;
        }
        
        if (location) {
            query.location = new RegExp(location, 'i');
        }
        
        if (jobType) {
            query.jobType = jobType;
        }
        
        if (workMode) {
            query.workMode = workMode;
        }
        
        if (company) {
            query.company = new RegExp(company, 'i');
        }
        
        if (minSalary || maxSalary) {
            query.$or = [];
            if (minSalary) {
                query.$or.push({ 'salary.min': { $gte: parseInt(minSalary) } });
            }
            if (maxSalary) {
                query.$or.push({ 'salary.max': { $lte: parseInt(maxSalary) } });
            }
        }
        
        if (skills) {
            const skillsArray = skills.split(',').map(skill => skill.trim());
            query.skills = { $in: skillsArray };
        }
        
        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagsArray };
        }
        
        if (datePosted) {
            const now = new Date();
            let dateFilter;
            
            switch (datePosted) {
                case 'today':
                    dateFilter = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    dateFilter = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    dateFilter = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                default:
                    dateFilter = null;
            }
            
            if (dateFilter) {
                query.createdAt = { $gte: dateFilter };
            }
        }
        
        let sortOptions = {};
        switch (sortBy) {
            case 'date':
                sortOptions = { createdAt: -1 };
                break;
            case 'salary':
                sortOptions = { 'salary.max': -1 };
                break;
            case 'relevance':
            default:
                if (q) {
                    sortOptions = { score: { $meta: 'textScore' } };
                } else {
                    sortOptions = { featured: -1, createdAt: -1 };
                }
                break;
        }
        const jobs = await Job.find(query)
            .populate('postedBy', 'firstname lastname email')
            .populate('category', 'name color')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalJobs = await Job.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limit);
        
        return res.status(200).send({
            jobs,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalJobs,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            searchQuery: {
                q,
                category,
                location,
                jobType,
                workMode,
                company,
                minSalary,
                maxSalary,
                skills,
                tags,
                datePosted,
                sortBy
            }
        });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getSearchSuggestions = async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;
        
        if (!q || q.length < 2) {
            return res.status(200).send({ suggestions: [] });
        }
        
        const suggestions = {};
        
        if (type === 'all' || type === 'titles') {
            const titleSuggestions = await Job.distinct('title', {
                title: new RegExp(q, 'i'),
                status: 'Published'
            }).limit(5);
            suggestions.titles = titleSuggestions;
        }
        
        if (type === 'all' || type === 'companies') {
            const companySuggestions = await Job.distinct('company', {
                company: new RegExp(q, 'i'),
                status: 'Published'
            }).limit(5);
            suggestions.companies = companySuggestions;
        }
        
        if (type === 'all' || type === 'locations') {
            const locationSuggestions = await Job.distinct('location', {
                location: new RegExp(q, 'i'),
                status: 'Published'
            }).limit(5);
            suggestions.locations = locationSuggestions;
        }
        
        if (type === 'all' || type === 'skills') {
            const skillsSuggestions = await Job.aggregate([
                { $match: { status: 'Published' } },
                { $unwind: '$skills' },
                { $match: { skills: new RegExp(q, 'i') } },
                { $group: { _id: '$skills', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $project: { _id: 1 } }
            ]);
            suggestions.skills = skillsSuggestions.map(item => item._id);
        }
        
        return res.status(200).send({ suggestions });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const getSearchFilters = async (req, res) => {
    try {
        const [jobTypes, workModes, categories, locations, companies, salaryRanges] = await Promise.all([
            Job.distinct('jobType', { status: 'Published' }),
            Job.distinct('workMode', { status: 'Published' }),
            Category.find({ isActive: true }, 'name color'),
            Job.distinct('location', { status: 'Published' }),
            Job.distinct('company', { status: 'Published' }),
            Job.aggregate([
                { $match: { status: 'Published', 'salary.min': { $exists: true } } },
                {
                    $group: {
                        _id: null,
                        minSalary: { $min: '$salary.min' },
                        maxSalary: { $max: '$salary.max' }
                    }
                }
            ])
        ]);
        
        const popularSkills = await Job.aggregate([
            { $match: { status: 'Published' } },
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            { $project: { skill: '$_id', count: 1, _id: 0 } }
        ]);
        
        const popularTags = await Job.aggregate([
            { $match: { status: 'Published' } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 15 },
            { $project: { tag: '$_id', count: 1, _id: 0 } }
        ]);
        
        return res.status(200).send({
            jobTypes,
            workModes,
            categories,
            locations: locations.slice(0, 20),
            companies: companies.slice(0, 20), 
            salaryRange: salaryRanges[0] || { minSalary: 0, maxSalary: 200000 },
            popularSkills,
            popularTags
        });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

const saveSearch = async (req, res) => {
    try {
        const { user } = req;
        const { searchQuery, name } = req.body;
        
        if (!searchQuery || !name) {
            throw new InputValidationException('Search query and name are required');
        }
        
        const User = require('../model/user');
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $push: {
                    savedSearches: {
                        name,
                        query: searchQuery,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );
        
        return res.status(200).send({ message: 'Search saved successfully' });
    } catch (error) {
        return res.status(error instanceof InputValidationException ? 400 : 500).send({ message: error.message });
    }
};

module.exports = {
    searchJobs,
    getSearchSuggestions,
    getSearchFilters,
    saveSearch
};
