'use strict';


module.exports = function($window, $timeout, modalService, scrollArea) {

	var TweenLite = require('TweenLite');
	var CSSPlugin = require('CSSPlugin');
	var IScroll = require('IScroll');

	return {
		replace: true,
		restrict: 'AE',
		scope: {
			board: '='
			// zoom: '=zoomOptions'
		},

		link: function(scope, element) {

			// Fix scroll area height on iPad
			if (navigator.userAgent.match(/iPad/i)) {
				var scroller = angular.element(document.getElementById('content-scrollarea'));
				// Height: 768 - safariAddressbarHeight(96) - topbarHeight(64) = 608
				scroller.css('height', '608px');
			}

			scrollArea.destroy();
			scrollArea.set(new IScroll('#content-scrollarea', {
				scrollX: true,
				scrollY: true,
				freeScroll: true,
				mouseWheel: true,
				scrollbars: true,
				interactiveScrollbars: true,
				disableMouse: false,

				indicators: {
					el: '#minimap',
					interactive: true,
					resize: false,
					shrink: false
				}
			}));

			$timeout(function() {
				scope.updateMinimapIndicator();

				// Set current background image
				scope.setBackground(scope.board.background);
			}, 0);

			scrollArea.refresh(0);

			scope.updateMinimapIndicator = function() {
				var isSidebarCollapsed = (localStorage.getItem('tb-sidebar-collapsed') === 'true');
				var scale = 0.1;

				var indicatorWidth = isSidebarCollapsed ? ($window.innerWidth - 74) : ($window.innerWidth - 232);
				indicatorWidth *= scale;
				var indicatorHeight = ($window.innerHeight - 64) * scale;

				var indicator = angular.element(document.getElementById('minimap-indicator'));
				indicator.css('width', indicatorWidth + 'px');
				indicator.css('height', indicatorHeight + 'px');
			}

			scope.promptBackgroundAdd = function() {
				var modalOptions = {
					template: require('../../partials/modal-backgroundadd.html'),
					windowClass: 'modal-size-lg'
				}

				var backgrounds = [];
				backgrounds.push({ name: 'Blank', url: 'none' });
				backgrounds.push({ name: 'Scrum', url: 'images/workflow_template_scrum.png' });
				backgrounds.push({ name: 'Business model', url: 'images/business_model_canvas_teamboard.png' });
				backgrounds.push({ name: 'SWOT', url: 'images/swot_teamboard.png' });
				backgrounds.push({ name: 'Customer journey', url: 'images/customer_journey_map_teamboard.png' });

				var userOptions = {
					backgrounds: backgrounds,
					currentBg: scope.board.background
				};

				modalService.show(modalOptions, userOptions).then(function(result) {
					scope.updateBackground(result.selectedBg);
				});
			}

			scope.updateBackground = function(bg) {
				scope.board.background = bg;
				scope.board.update()
					.then(function() {
						scope.setBackground(bg);
					});
			}

			scope.setBackground = function(bg) {
				element.css('background-image', 'url(../' + bg + ')');

				var minimap = angular.element(document.getElementById('minimap'));
				minimap.css('background-image', 'url(../' + bg + ')');
			}

			// triggered from TopBarController
			scope.$on('action:add-background', function(event, data) {
				scope.promptBackgroundAdd();
			});

			scope.$on('action:sidebar-collapse', function(event, isCollapsed) {
				scope.updateMinimapIndicator();
			});

			angular.element($window).bind('resize', function() {
				scope.updateMinimapIndicator();
			});

			// var zoom = scope.zoom;
			// var transformOrigin = 'center top';

			// scope.zoomOut = function() {
			// 	var html = angular.element(document.querySelector('html'))[0];
			// 	var scale = 0.9 * html.clientHeight / element[0].offsetHeight;
			// 	TweenLite.to(element, 0.6, { scale: scale, transformOrigin: transformOrigin });
			// }

			// scope.zoomNormal = function() {
			// 	TweenLite.to(element, 0.6, { scale: 1, transformOrigin: transformOrigin });
			// }

			// scope.$watch('zoom.out', function() {
			// 	if (zoom.out) {
			// 		scope.zoomOut();
			// 	}
			// 	else {
			// 		scope.zoomNormal();
			// 	}
			// });

			// scope.$watchCollection('tickets', function() {

			// });
		}
	};
}
