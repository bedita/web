import moment from 'moment';
import { t } from 'ttag';
import { PanelEvents } from '../panel-view';


const LOCALE = BEDITA.locale.slice(0, 2);

/**
 * Component to fetch and display changes' history.
 */
export default {
    template: `<div class="history-content" style="--module-color: ${BEDITA.currentModule.color}">
        <div v-if="isLoading" class="is-loading-spinner"></div>
        <details v-for="date in sortedDates" open>
            <summary class="pb-05 is-upppercase has-font-weight-bold"><: date :></summary>
            <ul class="history-items">
                <li class="history-item is-expanded py-05 has-border-gray-600" v-for="item in history[date]">
                    <div class="change-time"><: getFormattedTime(item.meta.created) :></div>
                    <div class="is-flex">by <a class="ml-05"><: getAuthorName(item.meta.user) :></a></div>
                    <div class="is-flex">
                        <button class="button button-text-white is-width-auto" @click.stop.prevent="showChanges(item)">info</button>
                        <button class="button button-text-white is-width-auto" @click.stop.prevent="onRestore(item)"><: t('restore') :></button>
                        <button class="button button-text-white is-width-auto" @click.stop.prevent="onClone(item.id)"><: t('clone') :></button>
                    </div>
                </li>
            </ul>
        </details>
    </div>`,

    data() {
        return {
            history: [],
            rawHistory: [],
            isLoading: false,
        };
    },

    props: {
        object: Object,
    },

    methods: {
        getFormattedTime: function (date) {
            return moment(date).format('kk:mm');
        },
        /**
         * Get formatted user name.
         * @param {Object} userObj User data
         * @return {string}
         */
        getAuthorName: function (userObj) {
            if (!userObj) {
                return;
            }
            const user = userObj.attributes;

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
        getActionLabel(action) {
            let label = t`${action.replace(/^\w/, (c) => c.toUpperCase())}d`;
            if (action !== 'trash' && action !== 'restore') {
                label += ':';
            }
            return label;
        },
        /**
         * Open panel to show changes.
         * @param {Object} data History item changes
         */
        showChanges(data) {
            PanelEvents.requestPanel({
                action: 'history-info',
                from: this,
                data,
            });
            PanelEvents.listen('history-info:restore', this, this.onRestore);
        },
        /**
         * Restore data from a point of history and place it in the form.
         * Ask for confirmation first.
         * @param {Object} item History item to restore
         */
        onRestore(item) {
            if (!confirm(t('Restored data will replace current data (you can still check the data before saving). Are you sure?'))) {
                return;
            }

            // const restored = this.restoreHistoryItem(item);
            // const form = this.$el.closest('#form-main');

            // Object.keys(this.object.attributes).forEach((key) => {
            //     // GESTIRE I FOTTUTI VALORI ARRAY DI restored[key]
            //     const elements = [...form.querySelectorAll(`[name="${key}"]`)];
            //     let elem = elements[0];
            //     if (elements.some((el) => el.type === 'checkbox' || el.type === 'radio')) {
            //         elem = elements.find((el) => el.value === restored[key]); // controllare se va anche coi checkbox
            //         if (elem) {
            //             // check the input representing the current value
            //             elem.checked = !!(key in restored);
            //         }
            //     } else {
            //         elem.value = key in restored ? restored[key] : '';
            //     }

            //     // manually trigger change event to let the app be aware of it
            //     elem.dispatchEvent(new Event('change', { bubbles: true }));
            // });

            // // close the panel if this method was called by it
            // PanelEvents.closePanel();

            window.location.replace(`${window.location.origin}${window.location.pathname}/history/${item.id}`);
        },
        /**
         * Open a new tab with the url to create a copy of the object at a certain point of the history.
         * @param {string} historyId ID of the history item to restore
         */
        onClone(historyId) {
            const title = document.getElementById('title').value || t('Untitled');
            const cloneTitle = title + '-copy';
            const origin = window.location.origin;
            const path = window.location.pathname.replace('/view/', '/clone/');
            const url = `${origin}${path}/history/${historyId}?title=${cloneTitle}`;
            const newTab = window.open(url, '_blank');
            newTab.focus();
        },
        /**
         * Restore the object as it was at a certain point of its history.
         * @param {Object} item History item representing the point to restore
         * @return {Object}
         */
        restoreHistoryItem(item) {
            const historyPart = this.rawHistory
                .filter((i) => moment(i.meta.created).isSameOrBefore(moment(item.created)))
                .sort((item1, item2) => moment(item1.meta.created).diff(moment(item2.meta.created)));

            const restoredData = historyPart.reduce((acc, val) => {
                const data = val.meta.changed;
                Object.keys(data).forEach((key) => acc[key] = data[key]);
                return acc;
            }, {});

            return restoredData;
        }
    },

    computed: {
        /**
         * Return sorted desc dates.
         * @return {Array}
         */
        sortedDates: function () {
            return Object.keys(this.history)
                .sort((date1, date2) => moment(date1, 'DD MMM YYYY').diff(moment(date2, 'DD MMM YYYY')))
                .reverse();
        },
    },

    async created() {
        moment.locale(LOCALE);
        const baseUrl = new URL(BEDITA.base).pathname;
        const options = {
            credentials: 'same-origin',
            headers: {
                accept: 'application/json',
            }
        };

        this.isLoading = true;
        const historyRes = await fetch(`${baseUrl}api/history?filter[resource_id]=${this.object.id}&page_size=100`, options);
        const historyJson = await historyRes.json();
        this.rawHistory = historyJson.data;

        // fetch users involved in the object history
        let usersId = this.rawHistory.map((change) => change.meta.user_id);
        usersId = [...new Set(usersId)]; // remove duplicates
        const userRes = await fetch(`${baseUrl}api/users?filter[id]=${usersId.join(',')}`, options);
        const userJson = await userRes.json();
        const users = userJson.data;

        // group changes by date
        this.history = this.rawHistory.reduce((accumulator, item) => {
            item.meta.user = users.find((user) => user.id == item.meta.user_id);
            const createdDate = moment(item.meta.created).format('DD MMM YYYY');
            accumulator[createdDate] = accumulator[createdDate] || [];
            accumulator[createdDate].push(item);
            return accumulator;
        }, {});

        // sort changes by time in descending order
        Object.keys(this.history).forEach((date) => this.history[date].reverse());

        this.$emit('count', historyJson.meta.pagination.count);
        this.isLoading = false;
    },
}