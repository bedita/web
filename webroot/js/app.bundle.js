(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{11:function(e,t){},15:function(e,t,i){e.exports=i(7)},6:function(e,t,i){"use strict";(function(e){i.d(t,"a",function(){return n});var s=i(0),a=i.n(s);const n={loadBeditaPlugins(){BEDITA.plugins.forEach(t=>{const i=(window[t]||e[t]).default;Object.keys(i).forEach(e=>{"object"==typeof i[e]&&(a.a.component(e,i[e]),console.debug(`%c[${e}]%c component succesfully registred from %c${t}%c Plugin`,"color: blue","color: black","color: red","color: black"))})})}}}).call(this,i(2))},7:function(e,t,i){"use strict";i.r(t);var s=i(0),a=i.n(s);a.a.filter("humanize",function(e){return e.split("_").map(function(e){return e.charAt(0).toUpperCase()+e.substring(1)}).join(" ")});const n={devtools:!0},o={delimiters:["<:",":>"]};for(let e in n)n.hasOwnProperty(e)&&(a.a.config[e]=n[e]);for(let e in o)o.hasOwnProperty(e)&&(a.a.options[e]=o[e]);const l={configFull:{toolbar:[{name:"document",groups:["mode"],items:["Source"]},{name:"basicstyles",groups:["basicstyles","cleanup"],items:["Bold","Italic","Underline","Strike","Subscript","Superscript","-","RemoveFormat"]},{name:"paragraph",groups:["list","blocks","align"],items:["NumberedList","BulletedList","-","Blockquote","JustifyLeft","JustifyCenter","JustifyRight","JustifyBlock"]},{name:"links",items:["Link","Unlink","Anchor"]},{name:"editAttributes",items:["Attr"]},{name:"editing",groups:["find"],items:["Find","Replace"]},{name:"insert",items:["Image","Table","HorizontalRule","SpecialChar","Formula"]},{name:"tools",items:["ShowBlocks","AutoCorrect"]},{name:"styles",items:["Format","Styles"]},{name:"clipboard",groups:["clipboard","undo"],items:["Cut","Copy","Paste","PasteText","PasteFromWord","-","Undo","Redo"]}],allowedContent:!0,language:BEDITA.currLang2,entities:!1,fillEmptyBlocks:!1,forcePasteAsPlainText:!0,startupOutlineBlocks:!0,height:200},configNormal:{toolbar:[{name:"document",groups:["mode"],items:["Source"]},{name:"basicstyles",groups:["basicstyles","cleanup"],items:["Bold","Italic","Underline","Strike","-","RemoveFormat"]},{name:"links",items:["Link","Unlink"]},{name:"clipboard",groups:["clipboard","undo"],items:["PasteText","PasteFromWord","-","Undo","Redo"]}],allowedContent:!0,language:BEDITA.currLang2,entities:!1,fillEmptyBlocks:!1,forcePasteAsPlainText:!0,startupOutlineBlocks:!0,height:200},configSimple:{toolbar:[{name:"document",groups:["mode"],items:["Source"]},{name:"basicstyles",groups:["basicstyles","cleanup"],items:["Bold","Italic","Underline","Strike","Subscript","Superscript","-","RemoveFormat"]},{name:"links",items:["Link","Unlink"]},{name:"clipboard",groups:["clipboard","undo"],items:["Undo","Redo"]},{name:"tools",items:["ShowBlocks"]}],allowedContent:!0,language:BEDITA.currLang2,entities:!1,fillEmptyBlocks:!1,forcePasteAsPlainText:!0,startupOutlineBlocks:!0,height:200}};i(11);var r=i(6),d={props:{ids:{type:String,default:()=>[]}},data:()=>({allIds:[],selectedRows:[],status:""}),created(){try{this.allIds=JSON.parse(this.ids)}catch(e){console.error(e)}},computed:{selectedIds(){return JSON.stringify(this.selectedRows)},allChecked(){return JSON.stringify(this.selectedRows.sort())==JSON.stringify(this.allIds.sort())}},methods:{toggleAll(){this.allChecked?this.unCheckAll():this.checkAll()},checkAll(){this.selectedRows=JSON.parse(JSON.stringify(this.allIds))},unCheckAll(){this.selectedRows=[]},exportSelected(){this.selectedRows.length<1||document.getElementById("form-export").submit()},setStatus(e,t){this.selectedRows.length<1||(this.status=e,this.$nextTick(()=>{document.getElementById("form-status").submit()}))},trash(){this.selectedRows.length<1||confirm("Move "+this.selectedRows.length+" item to trash")&&document.getElementById("form-delete").submit()},selectRow(e){if("checkbox"!=e.target.type){e.preventDefault();var t=e.target.querySelector("input[type=checkbox]");let i=this.selectedRows.indexOf(t.value);-1!=i?this.selectedRows.splice(i,1):this.selectedRows.push(t.value)}}}};const h="staggered";var c={template:`\n        <transition-group appear\n            name="${h}"\n            v-on:enter="enter"\n            v-on:after-enter="afterEnter">\n            <slot></slot>\n        </transition-group>`,props:{stagger:{type:String,default:()=>50}},methods:{enter(e,t){e.classList.remove(`${h}-enter-to`),e.classList.add(`${h}-enter`);const i=this.getDelay(e);setTimeout(()=>{this.$nextTick(()=>{e.classList.add(`${h}-enter`),e.classList.remove(`${h}-enter-to`),e.classList.remove(`${h}-enter-active`)}),t()},i)},afterEnter(e){this.$nextTick(()=>{e.classList.remove(`${h}-enter`),e.classList.remove(`${h}-enter-to`)})},getDelay(e){return e.dataset&&e.dataset.index*this.stagger+5}}};const p={count:1,page:1,page_size:20,page_count:1},g={data:()=>({objects:[],endpoint:null,pagination:p,query:{}}),methods:{getPaginatedObjects(e=!0,t={}){let i=window.location.href;if(this.endpoint){t&&(this.query=t);let s=`${i}/${this.endpoint}`;const a={credentials:"same-origin",headers:{accept:"application/json"}};return s=this.getUrlWithPaginationAndQuery(s),fetch(s,a).then(e=>e.json()).then(t=>{let i=(Array.isArray(t.data)?t.data:[t.data])||[];return t.data||(i=[]),e&&(this.objects=i),this.pagination=t.meta&&t.meta.pagination||this.pagination,i}).catch(e=>{console.error(e)})}return Promise.reject()},setPagination(e){let t="",i="?";return Object.keys(this.pagination).forEach((e,i)=>{t+=`${i?"&":""}${e}=${this.pagination[e]}`}),-1===e.indexOf(i)||(i="&"),`${e}${i}${t}`},getUrlWithPaginationAndQuery(e){let t="",i="?";return Object.keys(this.pagination).forEach((e,i)=>{t+=`${i?"&":""}${e}=${this.pagination[e]}`}),t.length>1&&(t+="&"),Object.keys(this.query).forEach((e,i)=>{t+=`${i?"&":""}${e}=${this.query[e]}`}),-1===e.indexOf(i)||(i="&"),`${e}${i}${t}`},findObjectById(e){let t=this.objects.filter(t=>t.id===e);return t.length&&t[0]},async loadMore(e=p.page_size){if(this.pagination.page_items<this.pagination.count){let t=await this.nextPage(!1);this.pagination.page_items=this.pagination.page_items+e<=this.pagination.count?this.pagination.page_items+e:this.pagination.count;const i=this.objects.length;this.objects.splice(i,0,...t)}},toPage(e,t={}){return this.pagination.page=e||1,this.getPaginatedObjects(!0,t)},firstPage(e=!0){return 1!==this.pagination.page?(this.pagination.page=1,this.getPaginatedObjects(e)):Promise.resolve([])},lastPage(e=!0){return this.pagination.page!==this.pagination.page_count?(this.pagination.page=this.pagination.page_count,this.getPaginatedObjects(e)):Promise.resolve([])},nextPage(e=!0){return this.pagination.page<this.pagination.page_count?(this.pagination.page=this.pagination.page+1,this.getPaginatedObjects(e)):Promise.resolve([])},prevPage(){return this.pagination.page>1?(this.pagination.page=this.pagination.page-1,this.getPaginatedObjects()):Promise.resolve()},setPageSize(e){this.pagination.page_size=e,this.pagination.page=1}}};var m={mixins:[g],components:{StaggeredList:c},props:{relationName:{type:String,required:!0},viewVisibility:{type:Boolean,default:()=>!1},addedRelations:{type:Array,default:()=>[]},hideRelations:{type:Array,default:()=>[]}},computed:{keyEvents(){return{esc:{keyup:this.handleKeyboard}}}},data:()=>({method:"relationshipsJson",loading:!1,pendingRelations:[],relationsData:[],isVisible:!1}),created(){this.endpoint=`${this.method}/${this.relationName}`},watch:{addedRelations(e){this.pendingRelations=e},pendingRelations(e){this.relationsData=this.relationFormatterHelper(e)},viewVisibility(e){this.isVisible=e},isVisible(){this.objects.length||this.loadObjects(),this.$nextTick(()=>{this.isVisible&&this.$refs.inputFilter&&this.$refs.inputFilter.focus()}),this.$emit("visibility-setter",this.isVisible)},loading(e){this.$parent.$emit("loading",e)}},methods:{async loadObjects(){this.loading=!0;let e=await this.getPaginatedObjects();return this.loading=!1,e},appendRelations(){this.$emit("append-relations",this.pendingRelations),this.isVisible=!1},handleKeyboard(e){this.isVisible&&(e.stopImmediatePropagation(),e.preventDefault(),this.hideRelationshipModal())},hideRelationshipModal(){this.pendingRelations=this.addedRelations,this.isVisible=!1},hasElementsToShow(){return this.objects.filter(e=>!this.hideRelations.filter(t=>e.id===t.id).length).length},relationFormatterHelper(e,t){let i="";try{i=JSON.stringify(e)}catch(e){console.error(e)}return i},containsId:(e,t)=>e.filter(e=>e.id===t).length}},u={name:"tree-list",template:'\n        <div\n            class="tree-list-node"\n            :class="treeListMode">\n\n            <div v-if="!isRoot">\n                <div v-if="multipleChoice"\n                    class="node-element"\n                    :class="{\n                        \'tree-related-object\': isRelated,\n                        \'disabled\': isCurrentObjectInPath,\n                        \'node-folder\': isFolder,\n                    }">\n\n                    <span\n                        @click.prevent.stop="toggle"\n                        class="icon"\n                        :class="nodeIcon"\n                        ></span>\n                    <input\n                        type="checkbox"\n                        :value="item"\n                        v-model="related"\n                    />\n                    <label\n                        @click.prevent.stop="toggle"\n                        :class="isFolder ? \'is-folder\' : \'\'"><: caption :></label>\n                </div>\n                <div v-else class="node-element"\n                    :class="{\n                        \'tree-related-object\': isRelated || stageRelated,\n                        \'was-related-object\': isRelated && !stageRelated,\n                        \'disabled\': isCurrentObjectInPath\n                    }"\n\n                    @click.prevent.stop="select">\n                    <span\n                        @click.prevent.stop="toggle"\n                        class="icon"\n                        :class="nodeIcon"\n                        ></span>\n                    <label><: caption :></label>\n                </div>\n            </div>\n            <div :class="isRoot ? \'\' : \'node-children\'" v-show="open" v-if="isFolder">\n                <tree-list\n                    @add-relation="addRelation"\n                    @remove-relation="removeRelation"\n                    @remove-all-relations="removeAllRelations"\n                    v-for="(child, index) in item.children"\n                    :key="index"\n                    :item="child"\n                    :multiple-choice="multipleChoice"\n                    :related-objects="relatedObjects"\n                    :object-id=objectId>\n                </tree-list>\n            </div>\n        </div>\n    ',data:()=>({stageRelated:!1,related:!1,open:!0}),props:{multipleChoice:{type:Boolean,default:!0},captionField:{type:String,required:!1,default:"name"},childrenField:{type:String,required:!1,default:"children"},item:{type:Object,required:!0,default:()=>{}},relatedObjects:{type:Array,default:()=>[]},objectId:{type:String,required:!1}},computed:{caption(){return this.item[this.captionField]},isFolder(){return this.item.children&&!!this.item.children.length},isRoot(){return this.item.root||!1},isRelated(){return!!this.item.id&&!!this.relatedObjects.filter(e=>e.id===this.item.id).length},isCurrentObjectInPath(){return this.item&&this.item.object&&-1!==this.item.object.meta.path.indexOf(this.objectId)},nodeIcon(){let e="";return e+=this.isFolder?this.open?"icon-down-dir":"icon-right-dir":"unicode-branch"},treeListMode(){let e=[];return this.isRoot&&e.push("root-node"),this.multipleChoice?e.push("tree-list-multiple-choice"):e.push("tree-list-single-choice"),this.isCurrentObject&&e.push("disabled"),e.join(" ")}},watch:{related(e){this.stageRelated=e},stageRelated(e){this.item.object&&(e?this.$emit("add-relation",this.item.object):this.$emit("remove-relation",this.item.object))},relatedObjects(){this.related=this.isRelated}},methods:{toggle(){this.isFolder&&(this.open=!this.open)},addRelation(e){this.$emit("add-relation",e)},removeRelation(e){this.$emit("remove-relation",e)},removeAllRelations(){this.$emit("remove-all-relations")},select(){this.isCurrentObjectInPath||(this.$emit("remove-all-relations"),this.stageRelated=!this.stageRelated)}}},b=i(1),f={extends:m,components:{TreeList:u},props:{relatedObjects:{type:Array,default:()=>[]},loadOnStart:[Boolean,Number],multipleChoice:{type:Boolean,default:!0}},data:()=>({jsonTree:{}}),created(){this.loadTree()},watch:{pendingRelations(e){let t=e.filter(e=>!this.isRelated(e.id));this.multipleChoice||t.length&&(t=t[0]),this.relationsData=this.relationFormatterHelper(t);let i=this.relatedObjects.filter(e=>!this.isPending(e.id));this.$emit("remove-relations",i)},objects(){this.pendingRelations=this.objects.filter(e=>this.isRelated(e.id))}},methods:{async loadTree(){if(this.loadOnStart){var e="number"==typeof this.loadOnStart?this.loadOnStart:0;await Object(b.a)(e),await this.loadObjects(),this.jsonTree={name:"Root",root:!0,object:{},children:this.createTree()}}},addRelation(e){e&&void 0!==!e.id?this.containsId(this.pendingRelations,e.id)||this.pendingRelations.push(e):console.error("[addRelation] needs first param (related) as {object} with property id set")},removeRelation(e){e&&e.id?this.pendingRelations=this.pendingRelations.filter(t=>t.id!==e.id):console.error("[removeRelation] needs first param (related) as {object} with property id set")},removeAllRelations(){this.pendingRelations=[],this._setChildrenData(this,"stageRelated",!1)},_setChildrenData(e,t,i){void 0!==e&&t in e&&(e[t]=i),e.$children.forEach(e=>{this._setChildrenData(e,t,i)})},createTree(){let e=[];return this.objects.forEach(t=>{let i=t.meta.path&&t.meta.path.split("/");if(i.length){i.shift();let s=e;i.forEach(e=>{let i=this.findPath(s,e);if(i)s=i.children;else{let i=t;i.id!==e&&(i=this.findObjectById(e));let a={id:e,related:this.isRelated(e),name:i.attributes.title||"",object:i,children:[]};s.push(a),s=a.children}})}}),e},findPath(e,t){let i=e.filter(e=>e.id===t);return!!i.length&&i[0]},isRelated(e){return!!this.relatedObjects.filter(t=>e===t.id).length},isPending(e){return!!this.pendingRelations.filter(t=>e===t.id).length}}},y={inject:["requestPanel","closePanel"],mixins:[g],components:{StaggeredList:c,RelationshipsView:m,TreeView:f},props:{relationName:{type:String,required:!0},loadOnStart:[Boolean,Number],multipleChoice:{type:Boolean,default:!0},configPaginateSizes:{type:String,default:"[]"}},data:()=>({method:"relatedJson",loading:!1,count:0,removedRelated:[],addedRelations:[],relationsData:[],newRelationsData:[],pageSize:p.page_size}),computed:{alreadyInView(){var e=this.addedRelations.map(e=>e.id),t=this.objects.map(e=>e.id);return e.concat(t)},paginateSizes(){return JSON.parse(this.configPaginateSizes)}},created(){this.endpoint=`${this.method}/${this.relationName}`},mounted(){this.loadOnMounted()},watch:{pageSize(e){this.setPageSize(e),this.loadRelatedObjects()},loading(e){this.$emit("loading",e)}},methods:{async loadOnMounted(){if(this.loadOnStart){var e="number"==typeof this.loadOnStart?this.loadOnStart:0;await Object(b.a)(e),await this.loadRelatedObjects()}},async loadRelatedObjects(){this.loading=!0;let e=await this.getPaginatedObjects();return this.loading=!1,this.$emit("count",this.pagination.count),e},relationToggle(e){e&&e.id?this.containsId(this.removedRelated,e.id)?this.undoRemoveRelation(e):this.removeRelation(e):console.error("[reAddRelations] needs first param (related) as {object} with property id set")},removeRelation(e){this.removedRelated.push(e),this.relationsData=JSON.stringify(this.removedRelated),this.$el.dispatchEvent(new Event("change",{bubbles:!0}))},undoRemoveRelation(e){let t=this.removedRelated.findIndex(t=>t.id!==e.id);this.removedRelated.splice(t,1),this.relationsData=JSON.stringify(this.removedRelated),this.$el.dispatchEvent(new Event("change",{bubbles:!0}))},setRemovedRelated(e){e&&(this.removedRelated=e,this.relationsData=JSON.stringify(this.removedRelated))},async toPage(e){this.loading=!0;let t=await g.methods.toPage.call(this,e);return this.loading=!1,t},removeAddedRelations(e){e?(this.addedRelations=this.addedRelations.filter(t=>t.id!==e),this.newRelationsData=JSON.stringify(this.addedRelations)):console.error("[removeAddedRelations] needs first param (id) as {Number|String}")},appendRelations(e){if(this.addedRelations.length)for(var t=this.addedRelations.map(e=>e.id),i=0;i<e.length;i++)t.indexOf(e[i].id)<0&&this.addedRelations.push(e[i]);else this.addedRelations=e;this.newRelationsData=JSON.stringify(this.addedRelations),this.$el.dispatchEvent(new Event("change",{bubbles:!0}))},containsId:(e,t)=>e.filter(e=>e.id===t).length,buildViewUrl:(e,t)=>`${window.location.protocol}//${window.location.host}/${e}/view/${t}`}},R={components:{PropertyView:{components:{RelationView:y},props:{tabOpen:{type:Boolean,default:!0},isDefaultOpen:{type:Boolean,default:!1}},data:()=>({isOpen:!0,isLoading:!1,count:0}),mounted(){this.isOpen=this.isDefaultOpen},watch:{tabOpen(){this.isOpen=this.tabOpen}},methods:{toggleVisibility(){this.isOpen=!this.isOpen},onToggleLoading(e){this.isLoading=e},onCount(e){this.count=e}}},RelationView:y},data:()=>({tabsOpen:!0}),computed:{keyEvents(){return{esc:{keyup:this.toggleTabs}}}},methods:{toggleTabs(){return this.tabsOpen=!this.tabsOpen}}},v={extends:d,methods:{restoreItem(){this.selectedRows.length<1||document.getElementById("form-restore").submit()},deleteItem(){this.selectedRows.length<1||confirm("Confirm deletion of "+this.selectedRows.length+" item from the trash")&&document.getElementById("form-delete").submit()}}},w={extends:R},O={data:()=>({fileName:""}),computed:{},methods:{onFileChanged(e){this.fileName=e.target.files[0].name}}},j=(i(10),{inject:["returnDataFromPanel","closePanel"],mixins:[g],props:{relationName:{type:String,default:""},alreadyInView:{type:Array,default:()=>[]},configPaginateSizes:{type:String,default:"[]"}},data:()=>({method:"relationshipsJson",endpoint:"",selectedObjects:[],pageSize:p.page_size,filter:"",queryFilter:{},timer:null}),computed:{paginateSizes(){return JSON.parse(this.configPaginateSizes)}},watch:{relationName:{immediate:!0,handler(e,t){e&&(this.selectedObjects=[],this.endpoint=`${this.method}/${e}`,this.loadObjects()),""===e&&Object(b.a)(500).then(()=>this.objects=[])}},pageSize(e){this.setPageSize(e),this.loadObjects()},loading(e){this.$emit("loading",e)},filter(e){clearTimeout(this.timer),this.timer=setTimeout(()=>{this.filter=e,(this.filter.length>=3||0==this.filter.length)&&(this.queryFilter={q:this.filter},this.loadObjects())},300)}},methods:{paginationPageLinkVisible(e){return this.pagination.page_count<=7||(1===e||e===this.pagination.page_count||e>=this.pagination.page-1&&e<=this.pagination.page+1)},returnData(){var e={objects:this.selectedObjects,relationName:this.relationName};this.$root.onRequestPanelToggle({returnData:e})},toggle(e,t){let i=this.selectedObjects.indexOf(e);-1!=i?this.selectedObjects.splice(i,1):this.selectedObjects.push(e)},async loadObjects(){this.objects=[],this.loading=!0;let e=await this.getPaginatedObjects(!0,this.queryFilter);return this.loading=!1,this.$emit("count",this.pagination.count),e},async toPage(e){this.objects=[],this.loading=!0,this.filter&&(this.queryFilter={q:this.filter});let t=await g.methods.toPage.call(this,e,this.queryFilter);return this.loading=!1,t}}}),P=i(5),$=i.n(P);i(9);const S={enableTime:!1,dateFormat:"Y-m-d H:i",altInput:!0,altFormat:"F j, Y - H:i",animate:!1};var k={install(e){e.directive("datepicker",{inserted(e,t,i){let s=S;i.data&&i.data.attrs&&i.data.attrs.time&&(s.enableTime=i.data.attrs.time);try{let t=$()(e,s),i=document.createElement("span");i.classList.add("clear-button"),i.innerHTML="&times;",i.addEventListener("click",()=>{t.clear()}),e.parentElement.appendChild(i)}catch(e){console.error(e)}}})}},I=i(4),E=i.n(I);i(8);const T={mode:"code",modes:["tree","code"],history:!0,search:!0};var B={install(e){e.directive("jsoneditor",{inserted(e){const t=e.value;try{const i=JSON.parse(t)||{};if(i){e.style.display="none";let t=document.createElement("div");t.className="jsoneditor-container",e.parentElement.insertBefore(t,e);let s=Object.assign(T,{onChange:function(){try{const t=e.jsonEditor.get();e.value=JSON.stringify(t),console.info("valid json :)")}catch(e){console.warn("still not valid json")}}});e.jsonEditor=new E.a(t,s),e.jsonEditor.set(i)}}catch(e){console.error(e)}}})}},F={install(e){e.directive("richeditor",{inserted(e){const t=e.getAttribute("ckconfig");let i={};l&&(i=l[t]);let s=CKEDITOR.replace(e,i);s.on("change",()=>{e.value=s.getData(),e.dispatchEvent(new Event("change",{bubbles:!0}))})}})}},N=i(3),x=i.n(N);const A=new a.a({el:"main",components:{ModulesIndex:d,ModulesView:R,TrashIndex:v,TrashView:w,ImportView:O,RelationsAdd:j},data:()=>({vueLoaded:!1,urlPagination:"",searchQuery:"",pageSize:"100",page:"",sort:"",panelIsOpen:!1,addRelation:{}}),provide(){return{requestPanel:(...e)=>this.requestPanel(...e),closePanel:(...e)=>this.closePanel(...e),returnDataFromPanel:(...e)=>this.returnDataFromPanel(...e)}},beforeCreate(){a.a.use(B),a.a.use(k),a.a.use(F),a.a.use(x.a),r.a.loadBeditaPlugins()},created(){this.vueLoaded=!0,this.loadUrlParams()},watch:{panelIsOpen(e){var t=document.querySelector("html").classList;e?t.add("is-clipped"):t.remove("is-clipped")}},mounted:function(){this.$nextTick(function(){"view"==BEDITA.template&&this.alertBeforePageUnload()})},methods:{pageClick(e){},returnDataFromPanel(e){this.closePanel(),e.relationName&&this.$refs.moduleView.$refs[e.relationName].$refs.relation.appendRelations(e.objects)},closePanel(){this.panelIsOpen=!1,this.addRelation={name:"",alreadyInView:[]}},requestPanel(e){this.panelIsOpen=!0,this.panelIsOpen&&e.relation&&e.relation.name&&(this.addRelation=e.relation)},loadUrlParams(){if(window.location.search){const e=window.location.search,t=/[?&]q=([^&#]*)/g;let i=e.match(t);i&&i.length&&(i=i.map(e=>e.replace(t,"$1")),this.searchQuery=i[0]);const s=/[?&]page_size=([^&#]*)/g;(i=e.match(s))&&i.length&&(i=i.map(e=>e.replace(s,"$1")),this.pageSize=this.isNumeric(i[0])?i[0]:"");const a=/[?&]page=([^&#]*)/g;(i=e.match(a))&&i.length&&(i=i.map(e=>e.replace(a,"$1")),this.page=this.isNumeric(i[0])?i[0]:"");const n=/[?&]sort=([^&#]*)/g;(i=e.match(n))&&i.length&&(i=i.map(e=>e.replace(n,"$1")),this.sort=i[0])}},buildUrlParams(e){let t=`${window.location.origin}${window.location.pathname}`,i=!0;return Object.keys(e).forEach(s=>{e[s]&&""!==e[s]&&(t+=`${i?"?":"&"}${s}=${e[s]}`,i=!1)}),t},updatePagination(){window.location.replace(this.urlPagination)},search(){this.page="",this.applyFilters()},resetResearch(){this.searchQuery="",this.applyFilters()},applyFilters(){let e=this.buildUrlParams({q:this.searchQuery,page_size:this.pageSize,page:this.page,sort:this.sort});window.location.replace(e)},alertBeforePageUnload(){var e=[...document.querySelectorAll("form")];e.forEach(e=>{e.addEventListener("change",()=>{e.changed=!0}),e.addEventListener("submit",t=>{!e.action.endsWith("/delete")||confirm("Do you really want to trash the object?")?e.submitting=!0:t.preventDefault()})}),window.onbeforeunload=function(){if(e.some(e=>e.changed)&&!e.some(e=>e.submitting))return"There are unsaved changes, are you sure you want to leave page?"}},isNumeric:e=>!isNaN(e)}});window._vueInstance=A}},[[15,0,1]]]);