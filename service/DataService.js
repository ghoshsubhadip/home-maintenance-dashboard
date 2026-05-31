sap.ui.define([], function () {
    "use strict";

    const API_BASE_URL = "http://localhost:3000/api";

    return {
        /**
         * Generic HTTP request handler
         */
        _request: function (url, method = "GET", body = null) {
            const options = {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                }
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            return fetch(`${API_BASE_URL}${url}`, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.success) {
                        throw new Error(data.error || "Unknown error occurred");
                    }
                    return data.data;
                })
                .catch(error => {
                    console.error("API Error:", error);
                    throw error;
                });
        },

        // ============================================
        // ISSUES API
        // ============================================

        getAllIssues: function () {
            return this._request("/issues");
        },

        getIssueById: function (issueId) {
            return this._request(`/issues/${issueId}`);
        },

        createIssue: function (issue) {
            return this._request("/issues", "POST", issue);
        },

        updateIssue: function (issueId, issue) {
            return this._request(`/issues/${issueId}`, "PUT", issue);
        },

        deleteIssue: function (issueId) {
            return this._request(`/issues/${issueId}`, "DELETE");
        },

        // ============================================
        // LABOUR API
        // ============================================

        getAllLabour: function () {
            return this._request("/labour");
        },

        getLabourByIssueId: function (issueId) {
            return this._request(`/labour/issue/${issueId}`);
        },

        createLabour: function (labour) {
            return this._request("/labour", "POST", labour);
        },

        // ============================================
        // MATERIALS API
        // ============================================

        getAllMaterials: function () {
            return this._request("/materials");
        },

        getMaterialsByIssueId: function (issueId) {
            return this._request(`/materials/issue/${issueId}`);
        },

        createMaterial: function (material) {
            return this._request("/materials", "POST", material);
        },

        // ============================================
        // KPIs API
        // ============================================

        getKPIs: function () {
            return this._request("/kpis");
        },

        // ============================================
        // HELPERS API
        // ============================================

        getNextIssueId: function () {
            return this._request("/helpers/next-issue-id");
        },

        getNextLabourId: function () {
            return this._request("/helpers/next-labour-id");
        },

        getNextMaterialId: function () {
            return this._request("/helpers/next-material-id");
        },

        // ============================================
        // COMBINED OPERATIONS
        // ============================================

        /**
         * Load all data needed for the dashboard
         */
        loadAllData: function () {
            return Promise.all([
                this.getAllIssues(),
                this.getAllLabour(),
                this.getAllMaterials(),
                this.getKPIs()
            ]).then(([issues, labour, materials, kpis]) => {
                return {
                    issues: issues || [],
                    labour: labour || [],
                    materials: materials || [],
                    kpis: kpis || {}
                };
            });
        }
    };
});
