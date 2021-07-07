/**
 *  Templates that uses this component (directly or indirectly):
 *  Template/Elements/relations.twig
 *  Template/Elements/trees.twig
 *  Template/Elements/roles.twig
 *
 * <relation-view> component used for ModulesPage -> View
 *
 * @property {String} relationName name of the relation used by the PaginatiedContentMixin
 * @property {Boolean} multipleChoice set view for multiple choice
 * @property {String} configPaginateSizes set pagination
 *
 * @requires
 *
 */

import flatpickr from 'flatpickr';

import { PaginatedContentMixin } from 'app/mixins/paginated-content';
import { RelationSchemaMixin } from 'app/mixins/relation-schema';
import { PanelEvents } from 'app/components/panel-view';
import { DragdropMixin } from 'app/mixins/dragdrop';

export default {
    mixins: [
        PaginatedContentMixin,
        RelationSchemaMixin,
        DragdropMixin,
    ],

    components: {
        RelationshipsView: () => import(/* webpackChunkName: "relationships-view" */'app/components/relation-view/relationships-view/relationships-view'),
        RolesListView: () => import(/* webpackChunkName: "roles-list-view" */'app/components/relation-view/roles-list-view'),
        FilterBoxView: () => import(/* webpackChunkName: "filter-box-view" */'app/components/filter-box'),
        DropUpload: () => import(/* webpackChunkName: "drop-upload" */'app/components/drop-upload'),
        LocationsView: () => import(/* webpackChunkName: "locations-view" */'app/components/locations-view/locations-view'),
    },

    props: {
        relationName: {
            type: String,
            required: true,
        },
        relationData: {
            type: Object,
            required: false,
        },
        multipleChoice: {
            type: Boolean,
            default: true,
        },
        configPaginateSizes: {
            type: String,
            default: '[]',
        },
        dataList: {
            type: Boolean,
            default: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        preCount: {
            type: Number,
            default: -1,
        },
    },

    data() {
        return {
            method: 'relatedJson',      // define AppController method to be used
            loading: false,
            objectsLoaded: false,       // objects loaded flag
            positions: {},              // used in children relations

            removedRelationsData: [],   // hidden field containing serialized json passed on form submit
            addedRelationsData: [],     // array of serialized new relations

            requesterId: null,          // panel requerster id
            removedRelated: [],         // staged removed related objects
            addedRelations: [],         // staged added objects to be saved
            modifiedRelations: [],      // staged modified relation params

            relationsData: [],          // hidden field containing serialized json passed on form submit
            activeFilter: {},           // current active filter for objects list

            positions: {},              // used in children relations
        }
    },

    computed: {
        // array of ids of objects in view
        alreadyInView() {
            let a = this.addedRelations.map(o => o.id);
            let b = this.objects.map(o => o.id);
            return a.concat(b);
        },

        /**
         * Show filter conditions.
         *
         * @returns {boolean}
         */
        showFilter() {
            return this.activeFilter.q ||
                this.pagination.page > 1 ||
                this.objects.length >= this.pagination.page_size ||
                this.addedRelations.length >= this.pagination.page_size;
        },
    },

    /**
     * setup correct endpoint for PaginatedContentMixin.getPaginatedObjects()
     *
     * @return {void}
     */
    created() {
        this.endpoint = `${this.method}/${this.relationName}`;
    },

    /**
    * load content after component is mounted
    *
    * @return {void}
    */
    async mounted() {
        // set up panel events
        PanelEvents.listen('edit-params:save', this, this.editParamsSave);
        PanelEvents.listen('relations-add:save', this, this.appendRelationsFromPanel);
        PanelEvents.listen('upload-files:save', this, this.appendRelationsFromPanel);
        PanelEvents.listen('panel:closed', null, this.resetPanelRequester);

        // if preCount is '-1' => no object count from API, force load
        if (this.preCount === -1 || this.$parent.isOpen) {
            await this.loadOnMounted();
        }

        // check if relation is related to media objects
        if (this.relationTypes && this.relationTypes.right) {
            // if true setup drop event that handles file upload

            if (this.isRelationWithMedia) {
                this.$on('drop-files', (ev, transfer) => {
                    let files = transfer.files;
                    if (files) {
                        // on drop-file event request panelView with action upload-files
                        this.disableDrop();
                        PanelEvents.requestPanel({
                            action: 'upload-files',
                            from: this,
                            data: { files },
                        });
                    }
                });
            }
        }

        // enable related objects drop
        this.$on('drop', (ev, transfer) => {
            let object = transfer.data;
            if (object) {
                this.appendRelations([object]);
                PanelEvents.send('relations-view:add-already-in-view', null, object );
            }
        });

        // enable related objects drop
        this.$on('sort-end', this.onSort);
    },

    beforeDestroy() {
        // destroy up panel events
        PanelEvents.stop('edit-params:save', this, this.editParamsSave);
        PanelEvents.stop('relations-add:save', this, this.appendRelationsFromPanel);
        PanelEvents.stop('upload-files:save', this, this.appendRelationsFromPanel);
        PanelEvents.stop('panel:closed', null, this.resetPanelRequester);
    },

    watch: {
        /**
         * Loading event emit
         *
         * @param {String} value The value associated to loading
         *
         * @emits Event#loading
         *
         * @return {void}
         */
        loading(value) {
            this.$emit('loading', value);
        },
    },

    methods: {
        // Events Listeners

        /**
         * listen to FilterBoxView event filter-objects
         *
         * @param {Object} filter
         *
         * @return {void}
         */
        onFilterObjects(filter) {
            this.activeFilter = filter;
            this.toPage(1, this.activeFilter);
        },

        /**
         * listen to FilterBoxView event filter-update-page-size
         *
         * @param {Number} pageSize
         *
         * @return {void}
         */
        onUpdatePageSize(pageSize) {
            this.setPageSize(pageSize);
            this.loadRelatedObjects(this.activeFilter, true);
        },

        /**
         * listen to FilterBoxView event filter-update-current-page
         *
         * @param {Number} page
         *
         * @return {void}
         */
        onUpdateCurrentPage(page) {
            this.toPage(page, this.activeFilter);
        },

        /**
         * edit single relation params
         *
         * @param {Object} object
         *
         * @returns {void}
         */
        editParamsSave(object) {
            this.updateRelationParams(object);
            this.closePanel();
        },

        /**
         *
         *
         * @param {Number} id
         *
         * @returns {Boolean} true if panel's open
         */
        isPanelOpen(id = null) {
            if (id === null) {
                return !!this.requesterId;
            }
            return this.requesterId === id;
        },

        // common relations priorities
        updatePriorities(movedObject, newIndex) {
            const oldIndex = this.objects.findIndex((object) => movedObject.id === object.id);

            // moves the object in the objects array from the old index to the new index
            this.objects.splice(newIndex, 0, this.objects.splice(oldIndex, 1)[0]);

            this.objects = this.objects.map((object, index) => {
                object.meta.relation.priority = index + 1;
                this.modifyRelation(object);
                return object;
            });
        },

        // children position
        updatePositions(movedObject, newIndex) {
            const oldIndex = this.objects.findIndex((object) => movedObject.id === object.id);

            // moves the object in the objects array from the old index to the new index
            this.objects.splice(newIndex, 0, this.objects.splice(oldIndex, 1)[0]);

            this.objects = this.objects.map((object, index) => {
                object.meta.relation.position = index + 1;
                object.meta.relation.position += this.pagination.page_size * (this.pagination.page - 1);
                this.modifyRelation(object);
                return object;
            });
        },

        /**
         * update relation position and stage for saving - children
         *
         * @param {Object} related related object
         *
         * @returns {void}
         */
        onInputPosition(related) {
            const oldPosition = related.meta.relation.position;
            const newPosition = this.positions[related.id] !== '' ? this.positions[related.id] : undefined;
            if (newPosition !== oldPosition) {
                // try to deep copy the object
                try {
                    const copy = JSON.parse(JSON.stringify(related));
                    copy.meta.relation.position = newPosition;
                    this.modifyRelation(copy);
                } catch (exp) {
                    // silent error
                    console.error('[RelationView -> updatePosition] something\'s wrong with the data');
                }
            } else {
                this.removeModifiedRelations(related.id);
            }
        },

        /**
        * extract relation with modified params and set it to staging
        *
        * @param {Object} data
        *
        * @returns {void}
        */
        updateRelationParams(related) {
            // id of edited related object
            const id = related.id;

            // extract related object from view
            const rel = this.objects.filter((object) => {
                if (object.id === id) {
                    return object;
                }
            }).pop();

            this.modifyRelation(rel);
        },

        /**
        * Event 'added-relations' callback
        * retrieve last added relations from relationships-view
        *
        * @param {Array} relations list of related objects to add
        *
        * @return {void}
        */
        appendRelations(relations) {
            if (!this.addedRelations.length) {
                this.addedRelations = relations;
            } else {
                let existingIds = this.addedRelations.map(a => a.id);
                for (let i = 0; i < relations.length; i++) {
                    if (existingIds.indexOf(relations[i].id) < 0) {
                        this.addedRelations.push(relations[i]);
                    }
                }
            }
            this.prepareRelationsToSave();
        },

        /**
         * add relations from panel and close it.
         *
         * @param {Array} relations
         *
         * @returns {void}
         */
        appendRelationsFromPanel(relations) {
            this.appendRelations(relations);
            this.closePanel();
            this.enableDrop();
        },

        /**
         * request panel for edit relation params
         * data object has to match edit-relation-params component property
         *
         * @param {Object} data
         */
        editRelationParams(data) {
            this.requesterId = data.related.id;
            PanelEvents.requestPanel({
                action: 'edit-relation-params',
                from: this,
                data,
            });
        },

        /**
         * reset panel requester id
         *
         * @returns {void}
         */
        resetPanelRequester() {
            this.requesterId = null;
        },

        /**
         * request panel for add related objects
         * data object has to match relations-add component property
         *
         * @param {Object} data request data
         *
         * @returns {void}
         */
        addRelatedObjects(data) {
            this.requesterId = data.object.id;
            PanelEvents.requestPanel({
                action: 'relations-add',
                from: this,
                data,
            });
        },

        /**
         * exectutes on sort objects in relation panel
         *
         * @param {Object}
         *
         * @returns {void}
         */
        onSort(transfer) {
            const list = Array.from(transfer.drop.children);
            const element = transfer.dragged;
            const newIndex = list.indexOf(element)
            const object = transfer.data;

            if (this.relationName == 'children') {
                this.updatePositions(object, newIndex);
            } else {
                object.meta.relation.priority = newIndex + 1;
                this.updatePriorities(object, newIndex);
            }
        },

        /**
         * close panel calling PanelEvent.closePanel
         *
         * @returns {void}
         */
        closePanel() {
            PanelEvents.closePanel();
        },

        /**
         * load content if flag set to true
         *
         * @return {void}
         */
        async loadOnMounted() {
            await this.loadRelatedObjects();
            return Promise.resolve();
        },

        /**
         * call PaginatedContentMixin.getPaginatedObjects() method and handle loading
         *
         * @emits Event#count count objects event
         *
         * @param {Object} filter object containing filters
         * @param {Boolean} force force reload of related objects
         *
         * @return {Array} objs objects retrieved
         */
        async loadRelatedObjects(filter = {}, force = false) {
            if (this.preCount === 0 || (this.objectsLoaded && !force)) {
                return [];
            }
            this.loading = true;

            return this.getPaginatedObjects(true, filter)
                .then((objs) => {
                    this.$emit('count', this.pagination.count);
                    this.loading = false;
                    this.objectsLoaded = true;
                    return objs;
                })
                .catch((error) => {
                    // code 20 is user aborted fetch which is ok
                    if (error.code !== 20) {
                        this.loading = false;
                        console.error(error);
                    }
                });
        },

        /**
         * reload all related objects
         * UNUSED
         *
         * @return {Array} objs objects retrieved
         */
        reloadObjects() {
            this.activeFilter = {};
            return this.loadRelatedObjects({}, true);
        },

        /**
         * toggle relation
         *
         * @param {object}
         *
         * @returns {void}
         */
        relationToggle(related) {
            if (!related || !related.id) {
                console.error('[relationToggle] needs first param (related) as {object} with property id set');
                return;
            }

            if (!this.containsId(this.removedRelated, related.id)) {
                this.removeRelation(related);
            } else {
                this.restoreRemovedRelation(related);
            }
        },

        /**
         * remove related object adding it to removedRelated Array
         *
         * @param {Object} related Related object
         *
         * @returns {void}
         */
        removeRelation(related) {
            this.removedRelated.push(related);
            this.prepareRelationsToRemove(this.removedRelated);

            // after relation is set to be removed we check if it was modified(therefore staged to be saved)
            if (this.containsId(this.modifiedRelations, related.id)) {
                // if yes we unstage it
                this.prepareRelationsToSave();
            }
        },

        /**
         * re-add removed related object: removing it from removedRelated Array
         *
         * @param {Object} related Related object
         *
         * @returns {void}
         */
        restoreRemovedRelation(related) {
            let index = this.removedRelated.findIndex((rel) => rel.id === related.id);
            this.removedRelated.splice(index, 1);
            this.prepareRelationsToRemove(this.removedRelated);

            // after restore previously removed relation, we check if it was modified
            if (this.containsId(this.modifiedRelations, related.id)) {
                // if yes we stage it for saving
                this.prepareRelationsToSave();
            }
        },

        /**
         * format and serialize object relations
         *
         * @param {Array} relations list of related objects to format
         *
         * @returns {void}
         */
        prepareRelationsToRemove(relations) {
            this.removedRelationsData = JSON.stringify(this.formatObjects(relations));

            const isChanged = !!relations.length;
            this.$el.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                detail: {
                    id: this.$vnode.tag,
                    isChanged,
                }
            }));
        },

        /**
         * prepare removeRelated Array for saving using serialized json input field
         *
         * @param {Array} relations list of related objects to be removed
         *
         * @returns {void}
         */
        setRemovedRelated(relations) {
            if (!relations) {
                return;
            }
            this.removedRelated = relations;
            this.prepareRelationsToRemove(this.removedRelated);
        },

        /**
         * remove element with matched id from staged relations
         *
         * @param {Number} id
         *
         * @returns {void}
         */
        removeAddedRelations(id) {
            if (!id) {
                console.error('[removeAddedRelations] needs first param (id) as {Number|String}');
                return;
            }
            this.addedRelations = this.addedRelations.filter((rel) => rel.id !== id);
            PanelEvents.send('relations-view:remove-already-in-view', null, { id } );


            this.prepareRelationsToSave();
        },

        /**
         * set modified relation to be saved
         *
         * @param {Object} related
         *
         * @returns {void}
         */
        modifyRelation(related) {
            if (this.containsId(this.modifiedRelations, related.id)) {
                // if object has been already modified we replace it within the modifiedRelations array
                this.modifiedRelations = this.modifiedRelations.map((object) => {
                    if (object.id === related.id) {
                        return related;
                    }
                    return object;
                });
            } else {
                // otherwise we add it to it
                this.modifiedRelations.push(related);
            }
            this.prepareRelationsToSave();
        },

        /**
         * remove element with matched id from staged relations
         *
         * @param {Number} id
         *
         * @returns {void}
         */
        removeModifiedRelations(id) {
            if (!id) {
                console.error('[removeModifiedRelations] needs first param (id) as {Number|String}');
                return;
            }
            this.modifiedRelations = this.modifiedRelations.filter((rel) => rel.id !== id);
            this.prepareRelationsToSave();
        },

        /**
         * set relations to be saved from both newly added and modified
         *
         * @returns {void}
         */
        prepareRelationsToSave() {
            const relations = this.addedRelations.concat(this.modifiedRelations);
            let difference = relations.filter(rel => !this.containsId(this.removedRelated, rel.id));

            this.addedRelationsData = JSON.stringify(this.formatObjects(difference));

            const isChanged = !!difference.length;
            this.$el.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                detail: {
                    id: this.$vnode.tag,
                    isChanged,
                }
            }));
        },

        /**
         * frontend specific formatting for relation params
         *
         * @param {string} key
         * @param {any} value
         *
         * @returns {String} formatted value
         */
        formatParam(key, value) {
            const schema = this.getRelationSchema();

            // formatting ISO 8061 date to human
            if (schema !== undefined && schema[key].format === 'date-time') {
                return flatpickr.formatDate(new Date(value), 'Y-m-d h:i K');
            }

            // oneOf
            if(schema && schema[key].oneOf) {
                const firstNotNull = schema[key].oneOf.find(p => p.type !== 'null');
                if (firstNotNull.format  === 'date-time') {
                    return flatpickr.formatDate(new Date(value), 'Y-m-d h:i K');
                }
            }

            return value;
        },

        /**
         * go to specific page
         *
         * @param {Number} page The page number
         * @param {Object} filter The filter to apply
         *
         * @return {void}
         */
        toPage(page, filter) {
            this.loading = true;

            PaginatedContentMixin.methods.toPage.call(this, page, filter)
                .then((objs) => {
                    this.loading = false;
                    return objs;
                })
                .catch((error) => {
                    // code 20 is user aborted fetch which is ok
                    if (error.code !== 20) {
                        this.loading = false;
                        console.error(error);
                    }
                });
        },

        /**
         * helper function: check if array relations has element with id -> id
         *
         * @param {Array} relations
         * @param {Number} id
         *
         * @return {Boolean} true if id is in Array relations
         */
        containsId(relations, id) {
            return !!relations.find((rel) => rel.id === id);
        },

        /**
         * helper function: build open view url
         *
         * @param {String} objectType
         * @param {Number} objectId
         *
         * @return {String} url
         */
        buildViewUrl(objectType, objectId) {
            return `${window.location.protocol}//${window.location.host}/${objectType}/view/${objectId}`;
        },

        /**
         * Object type available to view.
         *
         * @param {String} type
         *
         * @return {Boolean} true if module is available
         */
        moduleAvailable(type) {
            return (BEDITA.modules.indexOf(type) !== -1);
        },

        /**
         * Return true when related object has streams data.
         *
         * @param {Object} related The object
         * @returns
         */
        relatedStream(related) {
            if (!related.relationships.streams || !related.relationships.streams.data || related.relationships.streams.data.length === 0) {
                return false;
            }

            return related.relationships.streams.data[0].attributes;
        },

        /**
         * Get related object attribute.
         *
         * @param {Object} related The object
         * @param {String} attribute The attribute name
         * @param {String} format The format required, if any
         * @returns {String}
         */
        relatedAttribute(related, attribute, format) {
            let val = '';
            const stream = related.relationships.streams.data[0];
            if (attribute in stream.attributes) {
                val = stream.attributes[attribute];
            } else if (attribute in stream.meta) {
                val = stream.meta[attribute];
            }
            if (format === 'bytes') {
                return this.bytes(val);
            }

            return val;
        },

        /**
         * Get bytes representation of size.
         *
         * @param {Number} size The size
         * @returns {String}
         */
        bytes(size) {
            let i = size == 0 ? 0 : Math.floor( Math.log(size) / Math.log(1024) );

            return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
        }
    }

}
