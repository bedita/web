(window.webpackJsonp=window.webpackJsonp||[]).push([["relation-view"],{24:function(e,t,i){"use strict";i.d(t,"b",function(){return a}),i.d(t,"a",function(){return s}),i.d(t,"c",function(){return r});const a={count:0,page:1,page_size:20,page_count:1},s={q:"",filter:{type:[]}},r={data:()=>({requestsQueue:[],requestController:new AbortController,objects:[],endpoint:null,pagination:a,query:{},formatObjetsFilter:["params","priority","position","url"]}),methods:{getPaginatedObjects(e=!0,t={}){let i=window.location.href;if(this.endpoint){t&&(this.query=t);let a=`${i}/${this.endpoint}`;const s={credentials:"same-origin",headers:{accept:"application/json"}};a=this.getUrlWithPaginationAndQuery(a),this.requestsQueue.length>0&&(this.requestController.abort(),this.requestController=new AbortController),s.signal=this.requestController.signal;let r=fetch(a,s).then(e=>e.json()).then(t=>{this.requestsQueue.pop();let i=(Array.isArray(t.data)?t.data:[t.data])||[];return t.data||(i=[]),this.requestsQueue.length<1&&(e&&(this.objects=i),this.pagination=t.meta&&t.meta.pagination||this.pagination,i)}).catch(e=>{if(this.requestsQueue.pop(),20===e.code)throw e;console.error(e)});return this.requestsQueue.push(r),r}return Promise.reject()},formatObjects(e){if(void 0===e)return[];const t=[];return e.forEach(e=>{let i={};i.id=e.id,i.type=e.type;const a=e.meta.relation;if(a){let e={};this.formatObjetsFilter.forEach(t=>{a[t]&&(e[t]=a[t])}),Object.keys(e).length&&(i.meta={relation:e})}t.push(i)}),t},setPagination(e){let t="",i="?";return Object.keys(this.pagination).forEach((e,i)=>{t+=`${i?"&":""}${e}=${this.pagination[e]}`}),-1===e.indexOf(i)||(i="&"),`${e}${i}${t}`},getUrlWithPaginationAndQuery(e){let t="",i="?";return Object.keys(this.pagination).forEach((e,i)=>{t+=`${i?"&":""}${e}=${this.pagination[e]}`}),t.length>1&&(t+="&"),Object.keys(this.query).forEach((e,i)=>{const a=this.query[e];let s=`${e}=${a}`;if("filter"===e){let e="";Object.keys(a).forEach(t=>{""!==a[t]&&(e+=`filter[${t}]=${a[t]}`)}),s=e}t+=`${i?"&":""}${s}`}),-1===e.indexOf(i)||(i="&"),`${e}${i}${t}`},findObjectById(e){let t=this.objects.filter(t=>t.id===e);return t.length&&t[0]},async loadMore(e=a.page_size){if(this.pagination.page_items<this.pagination.count){let t=await this.nextPage(!1);this.pagination.page_items=this.pagination.page_items+e<=this.pagination.count?this.pagination.page_items+e:this.pagination.count;const i=this.objects.length;this.objects.splice(i,0,...t)}},toPage(e,t={}){return this.pagination.page=e||1,this.getPaginatedObjects(!0,t)},firstPage(e=!0){return 1!==this.pagination.page?(this.pagination.page=1,this.getPaginatedObjects(e)):Promise.resolve([])},lastPage(e=!0){return this.pagination.page!==this.pagination.page_count?(this.pagination.page=this.pagination.page_count,this.getPaginatedObjects(e)):Promise.resolve([])},nextPage(e=!0){return this.pagination.page<this.pagination.page_count?(this.pagination.page=this.pagination.page+1,this.getPaginatedObjects(e)):Promise.resolve([])},prevPage(){return this.pagination.page>1?(this.pagination.page=this.pagination.page-1,this.getPaginatedObjects()):Promise.resolve()},setPageSize(e){this.pagination.page_size=e,this.pagination.page=1}}}},25:function(e,t,i){"use strict";const a={data:()=>({_mutationObserver:null,attrs:[]}),mounted(){this.setMutationObserver(this.attrs)},destroyed(){this._mutationObserver.disconnect()},methods:{setMutationObserver(e){this._mutationObserver=new MutationObserver(this.onAttributeChanges),this._mutationObserver.observe(this.$el,{attributes:!0,attributeFilter:e,subtree:!0,attributeOldValue:!0})},setObservableAttrs(e){this.attrs=e,this._mutationObserver.disconnect(),this.setMutationObserver(this.attrs)},onAttributeChanges(e,t){}}};i.d(t,"a",function(){return s});const s={mixins:[a],props:{acceptedDrop:{type:Array,default:()=>[]}},data:()=>({attrs:["droppable","accepted-drop"],from:{},draggedElement:null,overElement:null,dropElement:null,acceptedDropArray:[],draggableElements:[],dragOverFirst:!0,antiGlitchTimer:null,_dropEnabled:!1}),mounted(){this.initDroppableElements(),this.initDraggableElements()},destroyed(){this.dropElement.removeEventListener("dragover",this.onDragover,!1),this.dropElement.removeEventListener("dragleave",this.onDragleave,!1),this.dropElement.removeEventListener("drop",this.onDrop,!1),this.draggableElements.length&&this.$el.removeEventListener("dragstart",this.onDragstart,!1)},methods:{onAttributeChanges(e,t){for(var i of e)if("attributes"==i.type)if("droppable"===i.attributeName)this.enableDrop(),this.dropElement=i.target;else if("accepted-drop"===i.attributeName){let e=i.target.getAttribute("accepted-drop");e&&(this.acceptedDropArray=e.split(","))}},initDroppableElements(){this.dropElement=this.$el;let e=this.$el.querySelector("[droppable]");if(e){this.enableDrop(),this.dropElement=e;let t=e.getAttribute("accepted-drop");t&&(this.acceptedDrop=t.split(","))}this.dropElement.addEventListener("drop",this.onDrop,!0),this.dropElement.addEventListener("dragover",this.onDragover,!0),this.dropElement.addEventListener("dragleave",this.onDragleave,!0)},initDraggableElements(){let e=this.$el.querySelectorAll("[draggable]");e.length&&(this.draggableElements=e,this.$el.addEventListener("dragstart",this.onDragstart,!0))},setDragdropData(e,t=null){e.dragdrop={dragged:this.draggedElement,over:this.overElement,drop:this.dropElement,data:t}},onDragstart(e){this.draggedElement=e.target,this.setDragdropData(e),this.$emit("dragstart",e)},onDragover(e){if(e.preventDefault(),e.stopPropagation(),this._dropEnabled){if(this.acceptedDrop.length){if(!this.acceptedDrop.reduce((e,t)=>e=e||this.draggedElement.matches(t),!1))return}window.clearTimeout(this.antiGlitchTimer),this.overElement=e.target,this.setDragdropData(e),this.dropElement.classList.add("dragover"),this.dragOverFirst&&(this.dragOverFirst=!1,this.$emit("dragover-once",e)),this.$emit("dragover",e)}},onDragleave(e){e.preventDefault(),e.stopPropagation(),this.overElement=null,this.setDragdropData(e),this.dragOverFirst=!0,this.antiGlitchTimer=window.setTimeout(()=>{this.dropElement.classList.remove("dragover"),this.isOverChild(e)||this.$emit("dragleave")},25)},onDrop(e){if(e.preventDefault(),e.stopPropagation(),!this._dropEnabled)return;this.setDragdropData(e),this.dropElement.classList.remove("dragover"),this.$emit("dragleave");let t=e.target.files||e.dataTransfer.files;t.length?(this.setDragdropData(e,t),this.$emit("drop-files",e)):this.$emit("drop",e)},isOverChild(e){if(!this.dropElement)return!1;let t=this.dropElement.getBoundingClientRect();const i=document.body.clientWidth,a=document.body.clientHeight;return!(e.clientX<=0||e.clientY<=0||e.clientX>i||e.clientY>a)&&(e.clientY>=t.top&&e.clientY<=t.bottom&&e.clientX>=t.left&&e.clientX<=t.right)},disableDrop(){this._dropEnabled=!1},enableDrop(){this._dropEnabled=!0}}}},28:function(e,t,i){"use strict";i.r(t);var a=i(20),r=i(27),n=i.n(r),o=i(24),l=i(6);const d={data:()=>({relationSchema:null,relationTypes:null,isRelationWithMedia:!1}),mounted(){this.parseRelationData()},methods:{parseRelationData(){return this.relationData?(this.relationSchema=this.getRelationSchema(),this.relationTypes={left:this.relationData.left,right:this.relationData.right},this.isRelationWithMedia=this.checkForMediaTypes(this.relationTypes.right),this.relationData):[]},checkForMediaTypes:e=>e&&e.reduce((e,t)=>e=e||-1!==l.a.indexOf(t),!1)||!1,relationHasParams(){return null!==this.relationData&&!!this.getRelationSchema()},getRelationSchema(){return null===this.relationSchema&&(this.relationSchema=null!==this.relationData&&this.relationData.attributes.params&&this.relationData.attributes.params.properties),this.relationSchema},getParamHelper:(e,t)=>e.meta.relation.params&&e.meta.relation.params[t]||null}};var h=i(3),p=i(25);t.default={mixins:[o.c,d,p.a],components:{RelationshipsView:()=>i.e("tree-view").then(i.bind(null,37)),RolesListView:()=>i.e("tree-view").then(i.bind(null,86)),FilterBoxView:()=>i.e("filter-box-view").then(i.bind(null,39)),TreeView:()=>i.e("tree-view").then(i.bind(null,87))},props:{relationName:{type:String,required:!0},relationData:{type:Object,required:!1},loadOnStart:[Boolean,Number],multipleChoice:{type:Boolean,default:!0},configPaginateSizes:{type:String,default:"[]"}},data:()=>({method:"relatedJson",loading:!1,count:0,requesterId:null,removedRelated:[],addedRelations:[],modifiedRelations:[],removedRelationsData:[],addedRelationsData:[],relationsData:[],activeFilter:{}}),computed:{alreadyInView(){let e=this.addedRelations.map(e=>e.id),t=this.objects.map(e=>e.id);return e.concat(t)}},created(){this.endpoint=`${this.method}/${this.relationName}`},async mounted(){h.a.listen("edit-params:save",this,this.editParamsSave),h.a.listen("relations-add:save",this,this.appendRelations),h.a.listen("upload-files:save",this,this.appendRelations),h.a.listen("panel:closed",null,this.resetPanelRequester),await this.loadOnMounted(),this.relationTypes&&this.relationTypes.right&&this.isRelationWithMedia&&this.$on("drop-files",e=>{let t=e.dragdrop.data;t&&(this.disableDrop(),h.a.requestPanel({action:"upload-files",from:this,data:{files:t}}))})},beforeDestroy(){h.a.stop("edit-params:save",this,this.editParamsSave),h.a.stop("relations-add:save",this,this.appendRelations),h.a.stop("upload-files:save",this,this.appendRelations),h.a.stop("panel:closed",null,this.resetPanelRequester)},watch:{loading(e){this.$emit("loading",e)}},methods:{onFilterObjects(e){this.activeFilter=e,this.toPage(1,this.activeFilter)},onUpdatePageSize(e){this.setPageSize(e),this.loadRelatedObjects(this.activeFilter)},onUpdateCurrentPage(e){this.toPage(e,this.activeFilter)},editParamsSave(e){this.updateRelationParams(e),this.closePanel()},isPanelOpen(e=null){return null===e?!!this.requesterId:this.requesterId===e},updateRelationParams(e){const t=e.id,i=this.objects.filter(e=>{if(e.id===t)return e}).pop();this.modifyRelation(i)},appendRelations(e){if(this.addedRelations.length){let t=this.addedRelations.map(e=>e.id);for(let i=0;i<e.length;i++)t.indexOf(e[i].id)<0&&this.addedRelations.push(e[i])}else this.addedRelations=e;this.prepareRelationsToSave(),this.closePanel(),this.enableDrop()},editRelationParams(e){this.requesterId=e.related.id,h.a.requestPanel({action:"edit-relation-params",from:this,data:e})},resetPanelRequester(){this.requesterId=null},addRelatedObjects(e){this.requesterId=e.object.id,h.a.requestPanel({action:"relations-add",from:this,data:e})},closePanel(){h.a.closePanel()},async loadOnMounted(){if(this.loadOnStart){const e="number"==typeof this.loadOnStart?this.loadOnStart:0;await Object(a.a)(e),await this.loadRelatedObjects()}return Promise.resolve()},async loadRelatedObjects(e={},t=!1){return this.loading=!0,this.getPaginatedObjects(!0,e).then(e=>(this.$emit("count",this.pagination.count),this.loading=!1,e)).catch(e=>{20!==e.code&&(this.loading=!1,console.error(e),s)})},reloadObjects(){return this.activeFilter={},this.loadRelatedObjects({},!0)},relationToggle(e){e&&e.id?this.containsId(this.removedRelated,e.id)?this.restoreRemovedRelation(e):this.removeRelation(e):console.error("[relationToggle] needs first param (related) as {object} with property id set")},removeRelation(e){this.removedRelated.push(e),this.prepareRelationsToRemove(this.removedRelated),this.containsId(this.modifiedRelations,e.id)&&this.prepareRelationsToSave()},restoreRemovedRelation(e){let t=this.removedRelated.findIndex(t=>t.id===e.id);this.removedRelated.splice(t,1),this.prepareRelationsToRemove(this.removedRelated),this.containsId(this.modifiedRelations,e.id)&&this.prepareRelationsToSave()},prepareRelationsToRemove(e){this.removedRelationsData=JSON.stringify(this.formatObjects(e));const t=!!e.length;this.$el.dispatchEvent(new CustomEvent("change",{bubbles:!0,detail:{id:this.$vnode.tag,isChanged:t}}))},setRemovedRelated(e){e&&(this.removedRelated=e,this.prepareRelationsToRemove(this.removedRelated))},removeAddedRelations(e){e?(this.addedRelations=this.addedRelations.filter(t=>t.id!==e),this.prepareRelationsToSave()):console.error("[removeAddedRelations] needs first param (id) as {Number|String}")},modifyRelation(e){this.containsId(this.modifiedRelations,e.id)?this.modifiedRelations=this.modifiedRelations.map(t=>t.id===e.id?e:t):this.modifiedRelations.push(e),this.prepareRelationsToSave()},removeModifiedRelations(e){e?(this.modifiedRelations=this.modifiedRelations.filter(t=>t.id!==e),this.prepareRelationsToSave()):console.error("[removeModifiedRelations] needs first param (id) as {Number|String}")},prepareRelationsToSave(){let e=this.addedRelations.concat(this.modifiedRelations).filter(e=>!this.containsId(this.removedRelated,e.id));this.addedRelationsData=JSON.stringify(this.formatObjects(e));const t=!!e.length;this.$el.dispatchEvent(new CustomEvent("change",{bubbles:!0,detail:{id:this.$vnode.tag,isChanged:t}}))},formatParam(e,t){const i=this.getRelationSchema();return void 0!==i&&"date-time"===i[e].format?n.a.formatDate(new Date(t),"Y-m-d h:i K"):t},toPage(e,t){this.loading=!0,o.c.methods.toPage.call(this,e,t).then(e=>(this.loading=!1,e)).catch(e=>{20!==e.code&&(this.loading=!1,console.error(e))})},containsId:(e,t)=>e.filter(e=>e.id===t).length,buildViewUrl:(e,t)=>`${window.location.protocol}//${window.location.host}/${e}/view/${t}`}}}}]);