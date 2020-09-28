import { t } from 'ttag';
import moment from 'moment';
import { PanelEvents } from '../panel-view';

export default {
    template: `<div class="history-info">
        <section class="fieldset shrinks">
            <header class="mx-1 tab tab-static unselectable">
                <h2>
                    <span>Version by</span>
                    <span class="has-font-weight-bold"><: authorName :></span>
                    <span>on</span>
                    <span><: formattedDate :></span>
                </h2>
            </header>
            <div class="px-1 shrinks">
                <h4><: actionLabel :></h4>
                <div class="is-flex-column">
                    <div v-for="(value, key) in changed"><: key | humanize :>: "<: value :>"</div>
                    <button class="mt-2" @click.stop.prevent="restore()"><: t('restore') :></button>
                </div>
            </div>
        </section>
    </div>`,

    props: {
        meta: Object,
    },

    data() {
        return {
            created: this.meta.created,
            changed: this.meta.changed,
            user: this.meta.user,
            user_action: this.meta.user_action,
        }
    },

    computed: {
        formattedDate: function() {
            return moment(this.created).format('D MMM YYYY kk:mm');
        },
        /**
         * Get formatted user name.
         * @param {Object} userObj User data
         * @return {string}
         */
        authorName: function() {
            if (!this.user) {
                return;
            }
            const user = this.user.attributes;

            return user.title ||
                `${user.name || ''} ${user.surname || ''}`.trim() ||
                user.username ||
                '';
        },
        /**
         * Translate user action.
         * Capitalize it before translation and then add colon.
         * @param {string} action User action name
         * @return {string}
         */
        actionLabel() {
            let label = t`${this.user_action.replace(/^\w/, (c) => c.toUpperCase())}d`;
            if (this.user_action !== 'trash' && this.user_action !== 'restore') {
                label += ':';
            }
            return label;
        },
    },

    methods: {
        restore() {
            PanelEvents.sendBack('history-info:restore', this.meta);
        }
    }
}