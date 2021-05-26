<?php
/**
 * BEdita, API-first content management framework
 * Copyright 2019 ChannelWeb Srl, Chialab Srl
 *
 * This file is part of BEdita: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE.LGPL or <http://gnu.org/licenses/lgpl-3.0.html> for more details.
 */
namespace App\Controller\Model;

use App\Controller\AppController;
use BEdita\SDK\BEditaClientException;
use Cake\Event\Event;
use Cake\Http\Exception\UnauthorizedException;
use Cake\Http\Response;
use Cake\Utility\Hash;

/**
 * Model base controller class
 *
 * @property \App\Controller\Component\PropertiesComponent $Properties
 */
abstract class ModelBaseController extends AppController
{
    /**
     * Resource type in use (object_types, properties, property_types)
     *
     * @var string
     */
    protected $resourceType = null;

    /**
     * Single resource view existence flag.
     *
     * @var bool
     */
    protected $singleView = true;

    /**
     * {@inheritDoc}
     */
    public function initialize(): void
    {
        parent::initialize();

        $this->loadComponent('Properties');

        $this->Schema->setConfig([
            'type' => $this->resourceType,
            'internalSchema' => true,
        ]);
    }

    /**
     * Restrict `model` module access to `admin` for now
     *
     * {@inheritDoc}
     */
    public function beforeFilter(Event $event): ?Response
    {
        $res = parent::beforeFilter($event);
        if ($res !== null) {
            return $res;
        }

        $roles = $this->Auth->user('roles');
        if (empty($roles) || !in_array('admin', $roles)) {
            throw new UnauthorizedException(__('Module access not authorized'));
        }

        return null;
    }

    /**
     * Display resources list.
     *
     * @return \Cake\Http\Response|null
     */
    public function index(): ?Response
    {
        $this->request->allowMethod(['get']);
        $query = $this->request->getQueryParams() + ['page_size' => 500];

        try {
            $response = $this->apiClient->get(
                sprintf('/model/%s', $this->resourceType),
                $query
            );
        } catch (BEditaClientException $e) {
            $this->log($e, 'error');
            $this->Flash->error($e->getMessage(), ['params' => $e]);

            return $this->redirect(['_name' => 'dashboard']);
        }

        $this->set('resources', (array)$response['data']);
        $this->set('meta', (array)$response['meta']);
        $this->set('links', (array)$response['links']);
        $this->set('schema', $this->Schema->getSchema());
        $this->set('properties', $this->Properties->indexList($this->resourceType));
        $this->set('filter', $this->Properties->filterList($this->resourceType));

        return null;
    }

    /**
     * View single resource.
     *
     * @param string|int $id Resource ID.
     *
     * @return \Cake\Http\Response|null
     */
    public function view($id): ?Response
    {
        try {
            $response = $this->apiClient->get(sprintf('/model/%s/%s', $this->resourceType, $id));
        } catch (BEditaClientException $e) {
            $this->log($e, 'error');
            $this->Flash->error($e->getMessage(), ['params' => $e]);

            return $this->redirect(['_name' => 'model:list:' . $this->resourceType]);
        }

        $resource = (array)$response['data'];
        $this->set(compact('resource'));
        $this->set('schema', $this->Schema->getSchema());
        $this->set('properties', $this->Properties->viewGroups($resource, $this->resourceType));

        return null;
    }

    /**
     * Save resource.
     *
     * @return \Cake\Http\Response|null
     */
    public function save(): ?Response
    {
        $data = $this->request->getData();
        $id = Hash::get($data, 'id');
        unset($data['id']);
        $body = [
            'data' => [
                'type' => $this->resourceType,
                'attributes' => $data,
            ],
        ];
        $endpoint = sprintf('/model/%s', $this->resourceType);

        try {
            if (empty($id)) {
                $response = $this->apiClient->post($endpoint, json_encode($body));
                $id = Hash::get($response, '$data.id');
            } else {
                $body['data']['id'] = $id;
                $this->apiClient->patch(sprintf('%s/%s', $endpoint, $id), json_encode($body));
            }
        } catch (BEditaClientException $e) {
            $this->log($e, 'error');
            $this->Flash->error($e->getMessage(), ['params' => $e]);
        }

        if (!$this->singleView) {
            return $this->redirect(['_name' => 'model:list:' . $this->resourceType]);
        }

        return $this->redirect(
            [
                '_name' => 'model:view:' . $this->resourceType,
                'id' => $id,
            ]
        );
    }

    /**
     * Remove single resource.
     *
     * @param string $id Resource ID.
     *
     * @return \Cake\Http\Response
     */
    public function remove(string $id): Response
    {
        try {
            $this->apiClient->delete(sprintf('/model/%s/%s', $this->resourceType, $id));
        } catch (BEditaClientException $e) {
            $this->log($e, 'error');
            $this->Flash->error($e->getMessage(), ['params' => $e]);
        }

        return $this->redirect(['_name' => 'model:list:' . $this->resourceType]);
    }

    /**
     * {@inheritDoc}
     */
    public function beforeRender(Event $event): ?Response
    {
        $this->set('resourceType', $this->resourceType);
        $this->set('moduleLink', ['_name' => 'model:list:' . $this->resourceType]);

        return parent::beforeRender($event);
    }
}
