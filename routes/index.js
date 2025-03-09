const express = require('express');
// const router = express.Router();
const path = require('path');

module.exports = (app) => {
    const router = express.Router();

    // Helper function to render admin views
    const renderAdminView = (viewName, options, res) => {
        const adminViewsPath = app.get('adminviews');
        res.render(path.join(adminViewsPath, viewName), options);
    };

    // Home page(realestate page)
    router.get('/', (req, res) => {
        res.render('realestate', { title: 'Home', currentRoute: '/' });
    });

    router.get('/about', (req, res) => {
        res.render('about', { title: 'About', currentRoute: '/about' });
    });

    // Properties page
    router.get('/properties', (req, res) => {
        res.render('properties', { title: 'Properties', currentRoute: '/properties' });
    });

    router.get('/contact-us', (req, res) => {
        res.render('contact-us', { title: 'Contact Us', currentRoute: '/contact-us' });
    });

    router.get('/user/property-list', (req, res) => {
        res.render('user/property-list', { title: 'Property List', currentRoute: '/user/property-list' });
    });

    router.get('/user/info', (req, res) => {
        res.render('user/info', { title: 'User Info', currentRoute: '/user/info'});
    });

    // User auth pages
    router.get('/user/login', (req, res) => {
        res.render('user/login', { 
            title: 'Houzing Login', 
            currentRoute: '/user/login' 
        });
    });

    router.get('/user/register', (req, res) => {
        res.render('user/register', { 
            title: 'Register Houzing Account', 
            currentRoute: '/user/register' 
        });
    });

    router.get('/user/forgot-password', (req, res) => {
        res.render('user/forgot-password', { 
            title: 'Forgot Password', 
            currentRoute: '/user/forgot-password' 
        });
    });

    // Property Detail page
    router.get('/property-detail', (req, res) => {
        const propertyId = req.query.id;
        if (!propertyId) {
            return res.redirect('/properties');
        }
        res.render('property-detail', { 
                        title: 'Property Detail', 
                        propertyId, 
                        currentRoute: '/property-detail' 
        });
    });

    router.get('/add-property', (req, res) => {
        res.render('add-property', { title: 'Add Property', currentRoute: '/add-property' });
    });

    router.get('/update-property', (req, res) => {
        res.render('add-property', { title: 'Update Property', currentRoute: '/update-property', mode: 'update' });
    });

    // Admin pages
    router.get('/admin', (req, res) => {
        renderAdminView('admin-login', 
                        { title: 'CRUD Construction Contractor', 
                        activePage: 'admin-login',
                        currentRoute: '/admin/admin-login' }, res);
    });
    
    router.get('/admin/construction-contractor', (req, res) => {
        renderAdminView('construction-contractor', 
                        { title: 'CRUD Construction Contractor', 
                        activePage: 'construction-contractor',
                        pageHeader: 'Construction Contractor',
                        currentRoute: '/admin/construction-contractor' }, res);
    });

    router.get('/admin/customer', (req, res) => {
        renderAdminView('customer', { 
            title: 'CRUD Customer', 
            activePage: 'customer',
            currentRoute: '/admin/customer' 
        }, res);
    });

    router.get('/admin/design-unit', (req, res) => {
        renderAdminView('design-unit', { 
            title: 'CRUD Design Unit', 
            activePage: 'design-unit',
            currentRoute: '/admin/design-unit' 
        }, res);
    });

    router.get('/admin/administrative-division', (req, res) => {
        renderAdminView('administrative-division', { 
            title: 'CRUD Administrative Division', 
            activePage: 'administrative-division',
            currentRoute: '/admin/administrative-division' 
        }, res);
    });

    router.get('/admin/employee', (req, res) => {
        renderAdminView('employee', { 
            title: 'CRUD Employee', 
            activePage: 'employee',
            currentRoute: '/admin/employee' 
        }, res);
    });

    router.get('/admin/investor', (req, res) => {
        renderAdminView('investor', { 
            title: 'CRUD Investor', 
            activePage: 'investor',
            currentRoute: '/admin/investor' 
        }, res);
    });

    router.get('/admin/legal-document', (req, res) => {
        renderAdminView('legal-document', { 
            title: 'CRUD Legal Document', 
            activePage: 'legal-document',
            currentRoute: '/admin/legal-document' 
        }, res);
    });

    router.get('/admin/master-layout', (req, res) => {
        renderAdminView('master-layout', { 
            title: 'CRUD Master Layout', 
            activePage: 'master-layout',
            currentRoute: '/admin/master-layout' 
        }, res);
    });

    router.get('/admin/project', (req, res) => {
        renderAdminView('project', { 
            title: 'CRUD Project', 
            activePage: 'project',
            currentRoute: '/admin/project' 
        }, res);
    });

    router.get('/admin/property', (req, res) => {
        renderAdminView('property', { 
            title: 'CRUD Property', 
            activePage: 'property',
            currentRoute: '/admin/property' 
        }, res);
    });

    router.get('/admin/region-link', (req, res) => {
        renderAdminView('region-link', { 
            title: 'CRUD Region Link', 
            activePage: 'region-link',
            currentRoute: '/admin/region-link' 
        }, res);
    });

    router.get('/admin/utility', (req, res) => {
        renderAdminView('utility', { 
            title: 'CRUD Utility', 
            activePage: 'utility',
            currentRoute: '/admin/utility' 
        }, res);
    });

    router.get('/admin/user-properties', (req, res) => {
        renderAdminView('user-properties', { 
            title: 'User Properties List', 
            activePage: 'user-properties',
            currentRoute: '/admin/user-properties' 
        }, res);
    });

    return router;
};
