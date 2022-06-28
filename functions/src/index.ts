import * as admin from "firebase-admin";
admin.initializeApp();

const propertyManagement = require('./property-management');
exports.propertyManagement = propertyManagement;

const activities = require('./activities');
exports.activities = activities;
