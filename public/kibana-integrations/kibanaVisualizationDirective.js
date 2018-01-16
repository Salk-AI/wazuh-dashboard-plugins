import $ from 'jquery';
const ownLoader = require('./loader/loader-import');

var app = require('ui/modules').get('apps/webinar_app', [])
    .directive('kbnVis', [function () {
        return {
            restrict: 'E',
            scope: {
                visID: '=visId',
                specificTimeRange: '=specificTimeRange'
            },
            controller: function VisController($scope, $rootScope, $location, savedVisualizations, implicitFilters) {
                if(!$rootScope.ownHandlers) $rootScope.ownHandlers = [];
                let implicitFilter = '';
                let visTitle       = '';
                let fullFilter     = '';
                let rendered       = false;
                let visualization  = null;
                let visHandler     = null;

                // Listen for changes
                $scope.$on('updateVis', function (event, query, filters) {
                    if (rendered) {
                        if (visTitle !== 'Wazuh App Overview General Agents status') { // We don't want to filter that visualization as it uses another index-pattern
                            if (query.query === '') {
                                fullFilter = implicitFilter;
                            }
                            else {
                                if (implicitFilter !== '') {
                                    fullFilter = implicitFilter + ' AND ' + query.query;
                                }
                                else {
                                    fullFilter = query.query;
                                }
                            }

                            console.log("updating inside", filters);
                            visualization.searchSource
                            .query({ language: 'lucene', query: fullFilter })
                            .set('filter', filters);
                        }
                    }
                });

                var renderComplete = function() {
                    rendered = true;
                    $rootScope.loadedVisualizations.push(true);
                    $rootScope.loadingStatus = `Rendering visualizations... ${Math.round((100 * $rootScope.loadedVisualizations.length / $rootScope.tabVisualizations[$location.search().tab]) * 100) / 100} %`;
                    if ($rootScope.loadedVisualizations.length >= $rootScope.tabVisualizations[$location.search().tab]) {
                        if (!visTitle !== 'Wazuh App Overview General Agents status') $rootScope.rendered = true;
                        // Forcing a digest cycle
                        if(!$rootScope.$$phase) $rootScope.$digest();
                    }
                    else if (!visTitle !== 'Wazuh App Overview General Agents status') $rootScope.rendered = false;
                };

                // Initializing the visualization
                const loader = ownLoader.getVisualizeLoader();

                savedVisualizations.get($scope.visID).then(savedObj => {
                    implicitFilter = savedObj.searchSource.get('query')['query'];
                    visTitle = savedObj.vis.title;
                    visualization = savedObj;

                    if (visTitle !== 'Wazuh App Overview General Agents status') { // We don't want to filter that visualization as it uses another index-pattern
                        visualization.searchSource
                        .query({ language: 'lucene', query: implicitFilter })
                        .set('filter', implicitFilters.loadFilters());
                    }

                    let params = {};

                    if ($scope.specificTimeRange) {
                        const timeRange = {
                            min: 'now-1d/d',
                            max: 'now'
                        };
                        params = {timeRange: timeRange}
                    }

                    $("#"+$scope.visID).on('renderStart', () => {
                        $rootScope.loadingStatus = "Fetching data...";
                    });

                    visHandler = loader.embedVisualizationWithSavedObject($("#"+$scope.visID), visualization, params); 
                    
                    $rootScope.ownHandlers.push(visHandler);

                    visHandler.addRenderCompleteListener(renderComplete);
                });
     
            }
        }
    }]);