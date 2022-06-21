# Role-based access
1. `sales`: does not have access to property management
2. `owner`: can view properties that they do own, that are under company's management
3. `customer-service`: can view any property in under company's management

# Goal
The module allows landlords to keep historical record of their properties: any changes made to it, related documents, events that happened during a tenant's stay, etc.

# Data structure
Each property `under-management`, aside from their defined properties, have:
1. An `activities` subcollection - a collection of activity objects
2. A `documents` subcollection - a collection of document objects