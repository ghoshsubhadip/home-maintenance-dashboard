sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("app.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            console.log("=== Component init START ===");
            
            // Set up the data model BEFORE parent init
            this._initializeDataModel();
            
            console.log("=== Model initialized, calling parent init ===");
            
            // Call the base component's init function
            // This will create the root view and call controller onInit
            UIComponent.prototype.init.apply(this, arguments);
            
            console.log("=== Component init COMPLETE ===");
        },

        _initializeDataModel: function () {
            // Initialize model with empty data - backend will provide actual data
            var oModel = new JSONModel({
                issues: [],
                labour: [],
                materials: [],
                categories: [
                    { key: "Civil", text: "Civil" },
                    { key: "Painting", text: "Painting" },
                    { key: "Plumbing", text: "Plumbing" },
                    { key: "Electrical", text: "Electrical" },
                    { key: "Carpentry", text: "Carpentry" },
                    { key: "Cleaning", text: "Cleaning" }
                ],
                locations: [
                    { key: "Bedroom", text: "Bedroom" },
                    { key: "Kitchen", text: "Kitchen" },
                    { key: "Bathroom", text: "Bathroom" },
                    { key: "LivingRoom", text: "Living Room" },
                    { key: "Outside", text: "Outside" },
                    { key: "Terrace", text: "Terrace" }
                ],
                priorities: [
                    { key: "Low", text: "Low" },
                    { key: "Medium", text: "Medium" },
                    { key: "High", text: "High" },
                    { key: "Critical", text: "Critical" }
                ],
                statuses: [
                    { key: "Open", text: "Open" },
                    { key: "InProgress", text: "In Progress" },
                    { key: "OnHold", text: "On Hold" },
                    { key: "Completed", text: "Completed" },
                    { key: "Cancelled", text: "Cancelled" }
                ],
                kpis: {
                    totalIssues: 0,
                    openIssues: 0,
                    inProgressIssues: 0,
                    completedIssues: 0,
                    totalEstimatedCost: 0,
                    totalActualCost: 0,
                    totalVariance: 0
                }
            });

            // Set default binding mode
            oModel.setDefaultBindingMode("TwoWay");
            
            // Set the model
            this.setModel(oModel);
            
            console.log("Model initialized with empty data structure");
            console.log("Backend will load actual data via DataService");
        }
    });
});
