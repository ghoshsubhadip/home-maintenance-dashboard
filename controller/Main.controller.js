sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "app/service/DataService"
], function (Controller, Fragment, MessageBox, MessageToast, DataService) {
    "use strict";

    return Controller.extend("app.controller.Main", {

        onInit: function () {
            console.log("*** Controller onInit START ***");
            
            this._oView = this.getView();
            this._oModel = this.getOwnerComponent().getModel();
            this._dataService = DataService;
            
            // Load data from backend
            this._loadData();
            
            console.log("*** Controller onInit COMPLETE ***");
        },

        /**
         * Load all data from backend API
         */
        _loadData: function () {
            var that = this;
            var oBusyDialog = new sap.m.BusyDialog({
                text: "Loading data..."
            });
            oBusyDialog.open();

            this._dataService.loadAllData()
                .then(function (oData) {
                    that._oModel.setData(oData);
                    console.log("*** Data loaded from backend successfully ***");
                    oBusyDialog.close();
                })
                .catch(function (error) {
                    console.error("*** Error loading data:", error);
                    oBusyDialog.close();
                    MessageBox.error("Failed to load data from server. Please ensure the backend is running.\n\nError: " + error.message);
                });
        },

        /**
         * Refresh data from backend
         */
        _refreshData: function () {
            this._loadData();
        },

        /* =========================================================== */
        /* Formatter Functions                                          */
        /* =========================================================== */

        formatPriorityState: function (sPriority) {
            switch (sPriority) {
                case "Critical":
                    return "Error";
                case "High":
                    return "Warning";
                case "Medium":
                    return "Information";
                case "Low":
                    return "Success";
                default:
                    return "None";
            }
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "Open":
                    return "Warning";
                case "InProgress":
                    return "Information";
                case "Completed":
                    return "Success";
                case "OnHold":
                    return "Warning";
                case "Cancelled":
                    return "Error";
                default:
                    return "None";
            }
        },

        formatCostState: function (nCost) {
            return nCost > 0 ? "Success" : "None";
        },

        formatVarianceState: function (nVariance) {
            if (nVariance > 0) {
                return "Success"; // Under budget (saved money)
            } else if (nVariance < 0) {
                return "Error"; // Over budget (overspent)
            }
            return "None";
        },

        /* =========================================================== */
        /* Event Handlers                                               */
        /* =========================================================== */

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oTable = this.byId("issuesTable");
            var oBinding = oTable.getBinding("items");

            if (!sQuery) {
                oBinding.filter([]);
                return;
            }

            var aFilters = [
                new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("issue_id", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("category", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("location", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, sQuery)
                    ],
                    and: false
                })
            ];

            oBinding.filter(aFilters);
        },

        onIssueSelect: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            var oContext = oSelectedItem.getBindingContext();
            var oIssue = oContext.getObject();
            
            MessageToast.show("Selected Issue: " + oIssue.issue_id);
        },

        onCreateIssue: function () {
            this._openCreateIssueDialog(null);
        },

        onEditIssue: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext();
            var oIssue = oContext.getObject();
            
            this._openCreateIssueDialog(oIssue);
        },

        onDeleteIssue: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext();
            var oIssue = oContext.getObject();
            var that = this;

            MessageBox.confirm(
                "Are you sure you want to delete issue '" + oIssue.issue_id + "'?",
                {
                    title: "Confirm Deletion",
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            that._deleteIssue(oIssue.issue_id);
                        }
                    }
                }
            );
        },

        onAddLabour: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext();
            var oIssue = oContext.getObject();
            
            this._openLabourDialog(oIssue);
        },

        onAddMaterial: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext();
            var oIssue = oContext.getObject();
            
            this._openMaterialDialog(oIssue);
        },

        /* =========================================================== */
        /* Dialog Management - Create Issue                             */
        /* =========================================================== */

        _openCreateIssueDialog: function (oIssueData) {
            var that = this;

            if (!this._oCreateIssueDialog) {
                Fragment.load({
                    id: this._oView.getId(),
                    name: "app.fragment.CreateIssueDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oCreateIssueDialog = oDialog;
                    that._oView.addDependent(that._oCreateIssueDialog);
                    that._showCreateIssueDialog(oIssueData);
                });
            } else {
                this._showCreateIssueDialog(oIssueData);
            }
        },

        _showCreateIssueDialog: function (oIssueData) {
            var that = this;
            
            if (oIssueData) {
                // Edit mode
                this._editMode = true;
                this._editIssueId = oIssueData.issue_id;
                this.byId("createIssueDialog").setTitle("Edit Issue");
                
                // Pre-fill form fields
                this.byId("issueIdInput").setValue(oIssueData.issue_id);
                this.byId("issueTitleInput").setValue(oIssueData.title);
                this.byId("issueDescInput").setValue(oIssueData.description);
                this.byId("categorySelect").setSelectedKey(oIssueData.category);
                this.byId("locationSelect").setSelectedKey(oIssueData.location);
                this.byId("prioritySelect").setSelectedKey(oIssueData.priority);
                this.byId("statusSelect").setSelectedKey(oIssueData.status);
                this.byId("estimatedCostInput").setValue(oIssueData.estimated_cost);
            } else {
                // Create mode
                this._editMode = false;
                this._editIssueId = null;
                this.byId("createIssueDialog").setTitle("Create New Issue");
                
                // Get next issue ID from backend
                this._dataService.getNextIssueId()
                    .then(function (nextId) {
                        that.byId("issueIdInput").setValue(nextId);
                    })
                    .catch(function (error) {
                        console.error("Error getting next issue ID:", error);
                        that.byId("issueIdInput").setValue("");
                    });
                
                // Clear form fields
                this.byId("issueTitleInput").setValue("");
                this.byId("issueDescInput").setValue("");
                this.byId("categorySelect").setSelectedKey("");
                this.byId("locationSelect").setSelectedKey("");
                this.byId("prioritySelect").setSelectedKey("Medium");
                this.byId("statusSelect").setSelectedKey("Open");
                this.byId("estimatedCostInput").setValue("");
            }
            
            this._oCreateIssueDialog.open();
        },

        onSaveIssue: function () {
            var oIssueData = {
                issue_id: this.byId("issueIdInput").getValue(),
                title: this.byId("issueTitleInput").getValue(),
                description: this.byId("issueDescInput").getValue(),
                category: this.byId("categorySelect").getSelectedKey(),
                location: this.byId("locationSelect").getSelectedKey(),
                priority: this.byId("prioritySelect").getSelectedKey(),
                status: this.byId("statusSelect").getSelectedKey(),
                estimated_cost: parseFloat(this.byId("estimatedCostInput").getValue()) || 0
            };

            // Validate
            if (!oIssueData.title || !oIssueData.category || !oIssueData.location) {
                MessageBox.error("Please fill all required fields.");
                return;
            }

            if (this._editMode) {
                this._updateIssue(oIssueData);
            } else {
                this._createIssue(oIssueData);
            }

            this.onCancelIssueDialog();
        },

        onCancelIssueDialog: function () {
            this._oCreateIssueDialog.close();
        },

        /* =========================================================== */
        /* Dialog Management - Labour Entry                             */
        /* =========================================================== */

        _openLabourDialog: function (oIssue) {
            var that = this;
            this._currentIssue = oIssue;

            if (!this._oLabourDialog) {
                Fragment.load({
                    id: this._oView.getId(),
                    name: "app.fragment.LabourEntryDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oLabourDialog = oDialog;
                    that._oView.addDependent(that._oLabourDialog);
                    that._showLabourDialog();
                });
            } else {
                this._showLabourDialog();
            }
        },

        _showLabourDialog: function () {
            // Clear form
            this.byId("labourWorkerInput").setValue("");
            this.byId("labourHoursInput").setValue("");
            this.byId("labourRateInput").setValue("");
            this.byId("labourDatePicker").setValue("");
            
            this._oLabourDialog.open();
        },

        onSaveLabour: function () {
            var that = this;
            var sWorkerName = this.byId("labourWorkerInput").getValue();
            var fHours = parseFloat(this.byId("labourHoursInput").getValue());
            var fRate = parseFloat(this.byId("labourRateInput").getValue());
            var sDate = this.byId("labourDatePicker").getValue();

            if (!sWorkerName || !fHours || !fRate || !sDate) {
                MessageBox.error("Please fill all fields.");
                return;
            }

            // Get next labour ID from backend
            this._dataService.getNextLabourId()
                .then(function (nextId) {
                    var oLabourData = {
                        labour_id: nextId,
                        issue_id: that._currentIssue.issue_id,
                        worker_name: sWorkerName,
                        hours: fHours,
                        rate_per_hour: fRate,
                        total_cost: fHours * fRate,
                        date: sDate
                    };

                    that._addLabour(oLabourData);
                    that.onCancelLabourDialog();
                })
                .catch(function (error) {
                    console.error("Error getting next labour ID:", error);
                    MessageBox.error("Failed to generate labour ID");
                });
        },

        onCancelLabourDialog: function () {
            this._oLabourDialog.close();
        },

        /* =========================================================== */
        /* Dialog Management - Material Entry                           */
        /* =========================================================== */

        _openMaterialDialog: function (oIssue) {
            var that = this;
            this._currentIssue = oIssue;

            if (!this._oMaterialDialog) {
                Fragment.load({
                    id: this._oView.getId(),
                    name: "app.fragment.MaterialEntryDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oMaterialDialog = oDialog;
                    that._oView.addDependent(that._oMaterialDialog);
                    that._showMaterialDialog();
                });
            } else {
                this._showMaterialDialog();
            }
        },

        _showMaterialDialog: function () {
            // Clear form
            this.byId("materialNameInput").setValue("");
            this.byId("materialQuantityInput").setValue("");
            this.byId("materialUnitInput").setValue("");
            this.byId("materialUnitCostInput").setValue("");
            this.byId("materialDatePicker").setValue("");
            
            this._oMaterialDialog.open();
        },

        onSaveMaterial: function () {
            var that = this;
            var sMaterialName = this.byId("materialNameInput").getValue();
            var fQuantity = parseFloat(this.byId("materialQuantityInput").getValue());
            var sUnit = this.byId("materialUnitInput").getValue();
            var fUnitCost = parseFloat(this.byId("materialUnitCostInput").getValue());
            var sDate = this.byId("materialDatePicker").getValue();

            if (!sMaterialName || !fQuantity || !sUnit || !fUnitCost || !sDate) {
                MessageBox.error("Please fill all fields.");
                return;
            }

            // Get next material ID from backend
            this._dataService.getNextMaterialId()
                .then(function (nextId) {
                    var oMaterialData = {
                        material_id: nextId,
                        issue_id: that._currentIssue.issue_id,
                        material_name: sMaterialName,
                        quantity: fQuantity,
                        unit: sUnit,
                        unit_cost: fUnitCost,
                        total_cost: fQuantity * fUnitCost,
                        date: sDate
                    };

                    that._addMaterial(oMaterialData);
                    that.onCancelMaterialDialog();
                })
                .catch(function (error) {
                    console.error("Error getting next material ID:", error);
                    MessageBox.error("Failed to generate material ID");
                });
        },

        onCancelMaterialDialog: function () {
            this._oMaterialDialog.close();
        },

        /* =========================================================== */
        /* Internal Methods - CRUD Operations                           */
        /* =========================================================== */

        _createIssue: function (oIssueData) {
            var that = this;
            
            this._dataService.createIssue(oIssueData)
                .then(function (createdIssue) {
                    MessageToast.show("Issue created successfully!");
                    that._refreshData();
                })
                .catch(function (error) {
                    console.error("Error creating issue:", error);
                    MessageBox.error("Failed to create issue: " + error.message);
                });
        },

        _updateIssue: function (oIssueData) {
            var that = this;
            
            this._dataService.updateIssue(this._editIssueId, oIssueData)
                .then(function (updatedIssue) {
                    MessageToast.show("Issue updated successfully!");
                    that._refreshData();
                })
                .catch(function (error) {
                    console.error("Error updating issue:", error);
                    MessageBox.error("Failed to update issue: " + error.message);
                });
        },

        _deleteIssue: function (sIssueId) {
            var that = this;
            
            this._dataService.deleteIssue(sIssueId)
                .then(function () {
                    MessageToast.show("Issue deleted successfully!");
                    that._refreshData();
                })
                .catch(function (error) {
                    console.error("Error deleting issue:", error);
                    MessageBox.error("Failed to delete issue: " + error.message);
                });
        },

        _addLabour: function (oLabourData) {
            var that = this;
            
            this._dataService.createLabour(oLabourData)
                .then(function (createdLabour) {
                    MessageToast.show("Labour entry added successfully!");
                    that._refreshData();
                })
                .catch(function (error) {
                    console.error("Error adding labour:", error);
                    MessageBox.error("Failed to add labour entry: " + error.message);
                });
        },

        _addMaterial: function (oMaterialData) {
            var that = this;
            
            this._dataService.createMaterial(oMaterialData)
                .then(function (createdMaterial) {
                    MessageToast.show("Material entry added successfully!");
                    that._refreshData();
                })
                .catch(function (error) {
                    console.error("Error adding material:", error);
                    MessageBox.error("Failed to add material entry: " + error.message);
                });
        },

        /* =========================================================== */
        /* Helper Functions                                             */
        /* =========================================================== */

        _getTodayDate: function () {
            var oDate = new Date();
            var sYear = oDate.getFullYear();
            var sMonth = String(oDate.getMonth() + 1).padStart(2, "0");
            var sDay = String(oDate.getDate()).padStart(2, "0");
            return sYear + "-" + sMonth + "-" + sDay;
        }
    });
});
