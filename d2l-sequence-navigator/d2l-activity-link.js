import { CompletionStatusMixin } from '../mixins/completion-status-mixin.js';
import { PolymerASVLaunchMixin } from '../mixins/polymer-asv-launch-mixin.js';
import './d2l-completion-status.js';
import './d2l-completion-requirement.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/icons/icon.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
/*
@memberOf window.D2L.Polymer.Mixins;
@mixes CompletionStatusMixin
@mixes PolymerASVLaunchMixin
*/

class D2LActivityLink extends PolymerASVLaunchMixin(CompletionStatusMixin()) {
	static get template() {
		return html`
		<style>
			:host {
				--d2l-left-icon-padding: 15px;
				display: block;
				@apply --d2l-body-compact-text;
			}

			:host > div {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
			}

			:host([show-loading-skeleton]) {
				cursor: unset;
			}

			:host([show-underline]) > #outer-container {
				border-bottom: 1px solid var(--d2l-color-mica);
			}
			#outer-container {
				border-bottom: 1px solid transparent;
				display: flex;
				flex-direction: row;
				flex: 1;
				padding: 10px 0;
			}

			#content-container {
				display: flex;
				flex: 1;
				cursor: pointer;
				justify-content: space-between;
				padding: 0 10px;
			}

			#title-container {
				display: inline-flex;
			}

			d2l-icon,
			a,
			d2l-completion-requirement,
			d2l-completion-status {
				vertical-align: top;
			}

			.d2l-activity-link-title {
				word-wrap: break-word;
			}

			a {
				@apply --d2l-body-compact-text;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				max-height: 3.0rem;
				-webkit-line-clamp: 2; /* number of lines to show */
				outline: none;
				text-decoration: none;
				color: var(--d2l-color-celestine);
			}

			a.d2l-activity-link-one-line {
				-webkit-line-clamp: 1; /* number of lines to show */
			}

			d2l-completion-requirement {
				--d2l-activity-link-subtext-color: var(--d2l-color-tungsten);
				color: var(--d2l-activity-link-subtext-color);
			}

			d2l-icon {
				padding-top: 3px;
				padding-right: var(--d2l-left-icon-padding);
				color: var(--d2l-color-celestine);
			}

			d2l-completion-status {
				color: var(--d2l-asv-text-color);
			}

			@keyframes loadingShimmer {
				0% { transform: translate3d(-100%, 0, 0); }
				100% { transform: translate3d(100%, 0, 0); }
			}

			#skeleton {
				height: 24px;
				width: 70%;
				border-radius: 8px;
				background-color: var(--d2l-color-sylvite);
				overflow: hidden;
				position: relative;
			}

			#skeleton::after {
				animation: loadingShimmer 1.8s ease-in-out infinite;
				background: linear-gradient(90deg, var(--d2l-color-sylvite), var(--d2l-color-regolith), var(--d2l-color-sylvite));
				background-color: var(--d2l-color-sylvite);
				content: '';
				height: 100%;
				left: 0;
				position: absolute;
				top: 0;
				width: 100%;
			}
		</style>
		<div id="outer-container">
			<template is="dom-if" if="[[showLoadingSkeleton]]">
				<div id="skeleton" class="skeleton"></div>
			</template>
			<template is="dom-if" if="[[!showLoadingSkeleton]]">
				<div id="content-container" on-click="_contentObjectClick">
					<div id="title-container">
						<template is="dom-if" if="[[hasIcon]]">
							<d2l-icon icon="[[_getIconSetKey(entity)]]"></d2l-icon>
						</template>
						<div class="d2l-activity-link-title">
							<a on-click="setCurrent" class$="[[completionRequirementClass]]" href="javascript:void(0)">
								[[entity.properties.title]]
							</a>
							<d2l-completion-requirement href="[[href]]" token="[[token]]">
							</d2l-completion-requirement>
						</div>
					</div>
					<d2l-completion-status href="[[href]]" token="[[token]]"></d2l-completion-status>
				</div>
			</template>
		</div>
`;
	}

	static get is() {
		return 'd2l-activity-link';
	}
	static get properties() {
		return {
			currentActivity: {
				type: String,
				value: '',
				notify: true
			},
			completionRequirementClass: {
				type: String,
				computed: '_getCompletionRequirementClass(entity)'
			},
			hasIcon: {
				type: Boolean,
				computed: '_hasIcon(entity)'
			},
			completionStatus: {
				type: String,
				computed: '_getCompletionStatus(entity)',
			},
			showLoadingSkeleton: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			showUnderline: {
				value: false,
				reflectToAttribute: true
			}
		};
	}
	static get observers() {
		return [
			'onCurrentActivityChanged(currentActivity, entity)',
			'_onEntityLoaded(entity)'
		];
	}

	ready() {
		super.ready();
		this.addEventListener('keypress', this._onKeyPress);
	}

	_onKeyPress(event) {
		if (event.key !== 'Enter') {
			return;
		}
		this.setCurrent();
	}

	setCurrent() {
		this.currentActivity = this.entity && this.entity.getLinkByRel('self').href;
		this.dispatchEvent(new CustomEvent('sequencenavigator-d2l-activity-link-current-activity', {detail: { href: this.href}}));
	}

	onCurrentActivityChanged(currentActivity, entity) {
		if (currentActivity && entity) {
			this.dispatchEvent(new CustomEvent('activitySelected', { detail:{ activityHref: currentActivity }, composed: true }));
		}
	}

	_hasIcon(entity) {
		const tierClass = 'tier1';
		return entity && entity.getSubEntityByClass(tierClass);
	}

	_getIconSetKey(entity) {
		const tierClass = 'tier1';
		return (entity.getSubEntityByClass(tierClass)).properties.iconSetKey;
	}

	_getCompletionRequirementClass(entity) {
		const completionRequirement = this._getCompletionRequirement(entity);
		switch (completionRequirement) {
			case 'exempt':
			case 'optional':
				return 'd2l-activity-link-one-line';
		}
		return '';
	}

	_onEntityLoaded(entity) {
		if (entity) {
			this.dispatchEvent(new CustomEvent('d2l-content-entity-loaded', {detail: { href: this.href}}));
		}
	}
}
customElements.define(D2LActivityLink.is, D2LActivityLink);
