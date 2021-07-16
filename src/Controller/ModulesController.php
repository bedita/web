<?php
/**
 * BEdita, API-first content management framework
 * Copyright 2018 ChannelWeb Srl, Chialab Srl
 *
 * This file is part of BEdita: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE.LGPL or <http://gnu.org/licenses/lgpl-3.0.html> for more details.
 */
namespace App\Controller;

use App\Core\Exception\UploadException;
use BEdita\SDK\BEditaClientException;
use Cake\Event\Event;
use Cake\Http\Exception\InternalErrorException;
use Cake\Http\Response;
use Cake\Utility\Hash;
use Psr\Log\LogLevel;

/**
 * Modules controller: list, add, edit, remove objects
 *
 * @property \App\Controller\Component\HistoryComponent $History
 * @property \App\Controller\Component\ObjectsEditorsComponent $ObjectsEditors
 * @property \App\Controller\Component\ProjectConfigurationComponent $ProjectConfiguration
 * @property \App\Controller\Component\PropertiesComponent $Properties
 * @property \App\Controller\Component\QueryComponent $Query
 * @property \App\Controller\Component\ThumbsComponent $Thumbs
 * @property \BEdita\WebTools\Controller\Component\ApiFormatterComponent $ApiFormatter
 */
class ModulesController extends AppController
{
    /**
     * Object type currently used
     *
     * @var string
     */
    protected $objectType = null;

    /**
     * {@inheritDoc}
     */
    public function initialize(): void
    {
        parent::initialize();

        $this->loadComponent('History');
        $this->loadComponent('ObjectsEditors');
        $this->loadComponent('Properties');
        $this->loadComponent('ProjectConfiguration');
        $this->loadComponent('Query');
        $this->loadComponent('Thumbs');
        $this->loadComponent('BEdita/WebTools.ApiFormatter');

        if (!empty($this->request)) {
            $this->objectType = $this->request->getParam('object_type');
            $this->Modules->setConfig('currentModuleName', $this->objectType);
            $this->Schema->setConfig('type', $this->objectType);
        }

        $this->Security->setConfig('unlockedActions', ['saveJson']);
    }

    /**
     * {@inheritDoc}
     * @codeCoverageIgnore
     */
    public function beforeRender(Event $event): ?Response
    {
        $this->set('objectType', $this->objectType);

        return parent::beforeRender($event);
    }

    /**
     * Display resources list.
     *
     * @return \Cake\Http\Response|null
     */
    public function index(): ?Response
    {
        $this->request->allowMethod(['get']);

        // handle filter and query parameters using session
        $result = $this->applySessionFilter();
        if ($result != null) {
            return $result;
        }

        try {
            $response = $this->apiClient->getObjects($this->objectType, $this->Query->index());
        } catch (BEditaClientException $e) {
            $this->log($e, LogLevel::ERROR);
            $this->Flash->error($e->getMessage(), ['params' => $e]);
            // remove session filter to avoid error repetition
            $session = $this->request->getSession();
            $session->delete(sprintf('%s.filter', $this->Modules->getConfig('currentModuleName')));

            return $this->redirect(['_name' => 'dashboard']);
        }

        $this->ProjectConfiguration->read();

        $response = $this->ApiFormatter->embedIncluded((array)$response);
        $objects = (array)Hash::get($response, 'data');
        $this->set('objects', $objects);
        $this->set('meta', (array)Hash::get($response, 'meta'));
        $this->set('links', (array)Hash::get($response, 'links'));
        $this->set('types', ['right' => $this->Schema->descendants($this->objectType)]);

        $this->set('properties', $this->Properties->indexList($this->objectType));

        // base/custom filters for filter view
        $this->set('filter', $this->Properties->filterList($this->objectType));

        // base/custom bulk actions for index view
        $this->set('bulkActions', $this->Properties->bulkList($this->objectType));

        // objectTypes schema
        $this->set('schema', $this->getSchemaForIndex($this->objectType));

        // set prevNext for views navigations
        $this->setObjectNav($objects);

        return null;
    }

    /**
     * View single resource.
     *
     * @param string|int $id Resource ID.
     * @return \Cake\Http\Response|null
     */
    public function view($id): ?Response
    {
        $this->request->allowMethod(['get']);

        try {
            $query = ['count' => 'all'];
            $response = $this->apiClient->getObject($id, $this->objectType, $query);
        } catch (BEditaClientException $e) {
            // Error! Back to index.
            $this->log($e, LogLevel::ERROR);
            $this->Flash->error(__('Error retrieving the requested content'), ['params' => $e]);

            return $this->redirect(['_name' => 'modules:list', 'object_type' => $this->objectType]);
        }
        $this->ProjectConfiguration->read();

        $revision = Hash::get($response, 'meta.schema.' . $this->objectType . '.revision', null);
        $schema = $this->Schema->getSchema($this->objectType, $revision);

        $object = $response['data'];

        // setup `currentAttributes` and recover failure data from session.
        $this->Modules->setupAttributes($object);

        $included = (!empty($response['included'])) ? $response['included'] : [];
        $typeIncluded = (array)Hash::combine($included, '{n}.id', '{n}', '{n}.type');
        $streams = Hash::get($typeIncluded, 'streams');
        $this->History->load($id, $object);
        $this->set(compact('object', 'included', 'schema', 'streams'));
        $this->set('properties', $this->Properties->viewGroups($object, $this->objectType));

        // setup relations metadata
        $this->Modules->setupRelationsMeta(
            $this->Schema->getRelationsSchema(),
            $object['relationships'],
            $this->Properties->relationsList($this->objectType)
        );

        // set objectNav
        $objectNav = $this->getObjectNav((string)$id);
        $this->set('objectNav', $objectNav);

        $this->ObjectsEditors->update((string)$id);

        return null;
    }

    /**
     * View single resource by id, doing a proper redirect (302) to resource module view by type.
     * If no resource found by ID, redirect to referer.
     *
     * @param string|int $id Resource ID.
     * @return \Cake\Http\Response|null
     */
    public function uname($id): ?Response
    {
        try {
            $response = $this->apiClient->get(sprintf('/objects/%s', $id));
        } catch (BEditaClientException $e) {
            $msg = $e->getMessage();
            $error = $e->getCode() === 404 ?
                sprintf(__('Resource "%s" not found', true), $id) :
                sprintf(__('Resource "%s" not available. Error: %s', true), $id, $msg);
            $this->Flash->error($error);

            return $this->redirect($this->referer());
        }
        $_name = 'modules:view';
        $object_type = $response['data']['type'];
        $id = $response['data']['id'];

        return $this->redirect(compact('_name', 'object_type', 'id'));
    }

    /**
     * Display new resource form.
     *
     * @return \Cake\Http\Response|null
     */
    public function create(): ?Response
    {
        $this->viewBuilder()->setTemplate('view');

        // Create stub object with empty `attributes`.
        $schema = $this->Schema->getSchema();
        if (!is_array($schema)) {
            $this->Flash->error(__('Cannot create abstract objects or objects without schema'));

            return $this->redirect(['_name' => 'modules:list', 'object_type' => $this->objectType]);
        }
        $attributes = array_fill_keys(
            array_keys(
                array_filter(
                    $schema['properties'],
                    function ($schema) {
                        return empty($schema['readOnly']);
                    }
                )
            ),
            ''
        );
        $object = [
            'type' => $this->objectType,
            'attributes' => $attributes,
        ];

        $this->set(compact('object', 'schema'));
        $this->set('properties', $this->Properties->viewGroups($object, $this->objectType));
        $this->ProjectConfiguration->read();

        // setup relations metadata
        $relationships = (array)Hash::get($schema, 'relations');
        $this->Modules->setupRelationsMeta($this->Schema->getRelationsSchema(), $relationships);

        return null;
    }

    /**
     * Create or edit single resource.
     *
     * @return \Cake\Http\Response|null
     */
    public function save(): ?Response
    {
        $this->request->allowMethod(['post']);
        $requestData = $this->prepareRequest($this->objectType);
        // extract related objects data
        $relatedData = (array)Hash::get($requestData, '_api');
        unset($requestData['_api']);

        try {
            // upload file (if available)
            $this->Modules->upload($requestData);

            // save data
            $response = $this->apiClient->save($this->objectType, $requestData);
            $objectId = (string)Hash::get($response, 'data.id');
            $this->Modules->saveRelated($objectId, $this->objectType, $relatedData);
        } catch (InternalErrorException | BEditaClientException | UploadException $e) {
            // Error! Back to object view or index.
            $this->log($e, LogLevel::ERROR);
            $this->Flash->error($e->getMessage(), ['params' => $e]);

            // set session data to recover form
            $this->Modules->setDataFromFailedSave($this->objectType, $requestData);

            if ($this->request->getData('id')) {
                return $this->redirect(['_name' => 'modules:view', 'object_type' => $this->objectType, 'id' => $this->request->getData('id')]);
            }

            return $this->redirect(['_name' => 'modules:list', 'object_type' => $this->objectType]);
        }

        // annoying message removed, restore with https://github.com/bedita/manager/issues/71
        // $this->Flash->success(__('Object saved'));

        return $this->redirect([
            '_name' => 'modules:view',
            'object_type' => $this->objectType,
            'id' => $objectId,
        ]);
    }

    /**
     * Create new object from ajax request.
     *
     * @return void
     */
    public function saveJson(): void
    {
        $this->viewBuilder()->setClassName('Json'); // force json response
        $this->request->allowMethod(['post']);
        $requestData = $this->prepareRequest($this->objectType);
        // extract related objects data
        $relatedData = (array)Hash::get($requestData, '_api');
        unset($requestData['_api']);

        try {
            // upload file (if available)
            $this->Modules->upload($requestData);

            // save data
            $response = $this->apiClient->save($this->objectType, $requestData);
            $objectId = (string)Hash::get($response, 'data.id');
            $this->Modules->saveRelated($objectId, $this->objectType, $relatedData);
        } catch (BEditaClientException $error) {
            $this->log($error, LogLevel::ERROR);

            $this->set(compact('error'));
            $this->set('_serialize', ['error']);

            return;
        }
        if ($response['data']) {
            $response['data'] = [ $response['data'] ];
        }

        $this->Thumbs->urls($response);

        $this->set((array)$response);
        $this->set('_serialize', array_keys($response));
    }

    /**
     * Clone single object.
     *
     * @param string|int $id Object ID.
     * @return \Cake\Http\Response|null
     */
    public function clone($id): ?Response
    {
        $this->viewBuilder()->setTemplate('view');

        $schema = $this->Schema->getSchema();
        if (!is_array($schema)) {
            $this->Flash->error(__('Cannot create abstract objects or objects without schema'));

            return $this->redirect(['_name' => 'modules:list', 'object_type' => $this->objectType]);
        }
        try {
            $response = $this->apiClient->getObject($id, $this->objectType);
            $attributes = $response['data']['attributes'];
            $attributes['uname'] = '';
            unset($attributes['relationships']);
            $attributes['title'] = $this->request->getQuery('title');
        } catch (BEditaClientException $e) {
            $this->log($e, LogLevel::ERROR);
            $this->Flash->error($e->getMessage(), ['params' => $e]);

            return $this->redirect(['_name' => 'modules:view', 'object_type' => $this->objectType, 'id' => $id]);
        }
        $object = [
            'type' => $this->objectType,
            'attributes' => $attributes,
        ];
        $this->History->load($id, $object);
        $this->set(compact('object', 'schema'));
        $this->set('properties', $this->Properties->viewGroups($object, $this->objectType));

        return null;
    }

    /**
     * Delete single resource.
     *
     * @return \Cake\Http\Response|null
     */
    public function delete(): ?Response
    {
        $this->request->allowMethod(['post']);
        $ids = [];
        if (!empty($this->request->getData('ids'))) {
            if (is_string($this->request->getData('ids'))) {
                $ids = explode(',', $this->request->getData('ids'));
            }
        } else {
            $ids = [$this->request->getData('id')];
        }
        foreach ($ids as $id) {
            try {
                $this->apiClient->deleteObject($id, $this->objectType);
            } catch (BEditaClientException $e) {
                $this->log($e, LogLevel::ERROR);
                $this->Flash->error($e->getMessage(), ['params' => $e]);
                if (!empty($this->request->getData('id'))) {
                    return $this->redirect(['_name' => 'modules:view', 'object_type' => $this->objectType, 'id' => $this->request->getData('id')]);
                }

                return $this->redirect(['_name' => 'modules:view', 'object_type' => $this->objectType, 'id' => $id]);
            }
        }
        $this->Flash->success(__('Object(s) deleted'));

        return $this->redirect([
            '_name' => 'modules:list',
            'object_type' => $this->objectType,
        ]);
    }

    /**
     * Relation data load via API => `GET /:object_type/:id/related/:relation`
     *
     * @param string|int $id The object ID.
     * @param string $relation The relation name.
     * @return void
     */
    public function relatedJson($id, string $relation): void
    {
        if ($id === 'new') {
            $this->set('data', []);
            $this->set('_serialize', ['data']);

            return;
        }

        $this->request->allowMethod(['get']);
        $query = $this->Query->prepare($this->request->getQueryParams());
        try {
            $response = $this->apiClient->getRelated($id, $this->objectType, $relation, $query);
            $response = $this->ApiFormatter->embedIncluded((array)$response);
        } catch (BEditaClientException $error) {
            $this->log($error, LogLevel::ERROR);

            $this->set(compact('error'));
            $this->set('_serialize', ['error']);

            return;
        }

        $this->Thumbs->urls($response);

        $this->set((array)$response);
        $this->set('_serialize', array_keys($response));
    }

    /**
     * Load resources of $type callig api `GET /:type/`
     * Json response
     *
     * @param string|int $id the object identifier.
     * @param string $type the resource type name.
     * @return void
     */
    public function resourcesJson($id, string $type): void
    {
        $this->request->allowMethod(['get']);
        $query = $this->Query->prepare($this->request->getQueryParams());
        try {
            $response = $this->apiClient->get($type, $query);
        } catch (BEditaClientException $error) {
            $this->log($error, LogLevel::ERROR);

            $this->set(compact('error'));
            $this->set('_serialize', ['error']);

            return;
        }

        $this->set((array)$response);
        $this->set('_serialize', array_keys($response));
    }

    /**
     * Relation data load callig api `GET /:object_type/:id/relationships/:relation`
     * Json response
     *
     * @param string|int $id The object ID.
     * @param string $relation The relation name.
     * @return void
     */
    public function relationshipsJson($id, string $relation): void
    {
        $this->request->allowMethod(['get']);
        $available = $this->availableRelationshipsUrl($relation);

        try {
            $query = $this->Query->prepare($this->request->getQueryParams());
            $response = $this->apiClient->get($available, $query);

            $this->Thumbs->urls($response);
        } catch (BEditaClientException $ex) {
            $this->log($ex, LogLevel::ERROR);

            $this->set([
                'error' => $ex->getMessage(),
                '_serialize' => ['error'],
            ]);

            return;
        }

        $this->set((array)$response);
        $this->set('_serialize', array_keys($response));
    }

    /**
     * Retrieve URL to get objects available for a relation
     *
     * @param string $relation The relation name.
     * @return string
     */
    protected function availableRelationshipsUrl(string $relation): string
    {
        $defaults = [
            'children' => '/objects',
            'parent' => '/folders',
            'parents' => '/folders',
        ];
        $defaultUrl = (string)Hash::get($defaults, $relation);
        if (!empty($defaultUrl)) {
            return $defaultUrl;
        }

        $relationsSchema = $this->Schema->getRelationsSchema();
        $types = $this->Modules->relatedTypes($relationsSchema, $relation);
        if (count($types) === 1) {
            return sprintf('/%s', $types[0]);
        }

        return '/objects?filter[type][]=' . implode('&filter[type][]=', $types);
    }

    /**
     * Bulk change actions for objects
     *
     * @return \Cake\Http\Response|null
     */
    public function bulkActions(): ?Response
    {
        $requestData = $this->request->getData();
        $this->request->allowMethod(['post']);

        if (!empty($requestData['ids'] && is_string($requestData['ids']))) {
            $ids = $requestData['ids'];
            $errors = [];

            // extract valid attributes to change
            $attributes = array_filter(
                $requestData['attributes'],
                function ($value) {
                    return ($value !== null && $value !== '');
                }
            );

            // export selected (filter by id)
            $ids = explode(',', $ids);
            foreach ($ids as $id) {
                $data = array_merge($attributes, ['id' => $id]);
                try {
                    $this->apiClient->save($this->objectType, $data);
                } catch (BEditaClientException $e) {
                    $errors[] = [
                        'id' => $id,
                        'message' => $e->getAttributes(),
                    ];
                }
            }

            // if errors occured on any single save show error message
            if (!empty($errors)) {
                $this->log($errors, LogLevel::ERROR);
                $this->Flash->error(__('Bulk Action failed on: '), ['params' => $errors]);
            }
        }

        return $this->redirect(['_name' => 'modules:list', 'object_type' => $this->objectType, '?' => $this->request->getQuery()]);
    }

    /**
     * get object properties and format them for index
     *
     * @param string $objectType objecte type name
     *
     * @return array $schema
     */
    public function getSchemaForIndex($objectType): array
    {
        $schema = (array)$this->Schema->getSchema($objectType);

        // if prop is an enum then prepend an empty string for select element
        if (!empty($schema['properties'])) {
            foreach ($schema['properties'] as &$property) {
                if (isset($property['enum'])) {
                    array_unshift($property['enum'], '');
                }
            }
        }

        return $schema;
    }
}
