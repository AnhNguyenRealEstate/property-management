import * as admin from "firebase-admin";
admin.initializeApp();

const propertyManagement = require('./property-management');
exports.propertyManagement = propertyManagement;

const activities = require('./activities');
exports.activities = activities;

const owners = require('./owners');
exports.owners = owners;

const paymentSchedules = require('./payment-schedules');
exports.paymentSchedules = paymentSchedules;

const invoices = require('./invoices');
exports.invoices = invoices;

const rentalExtension = require('./rental-extension');
exports.rentalExtension = rentalExtension;

const users = require('./users');
exports.users = users;
