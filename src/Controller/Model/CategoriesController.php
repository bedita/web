<?php
/**
 * BEdita, API-first content management framework
 * Copyright 2021 ChannelWeb Srl, Chialab Srl
 *
 * This file is part of BEdita: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE.LGPL or <http://gnu.org/licenses/lgpl-3.0.html> for more details.
 */
namespace App\Controller\Model;

use Cake\Event\Event;
use Cake\Http\Response;
use Cake\Utility\Hash;

/**
 * Categories Model Controller: list, add, edit, remove categories
 *
 */
class CategoriesController extends ModelBaseController
{
    /**
     * Resource type currently used
     *
     * @var string
     */
    protected $resourceType = 'categories';

    /**
     * Single resource view exists
     *
     * @var bool
     */
    protected $singleView = false;

    /**
     * {@inheritDoc}
     */
    public function beforeRender(Event $event): ?Response
    {
        $features = $this->Schema->objectTypesFeatures();
        $categorized = (array)Hash::get($features, 'categorized');
        $schema = $this->Schema->getSchema();
        $schema['properties']['type']['enum'] = $categorized;
        $filter = (array)$this->request->getQuery('filter');
        if (!empty($filter['type'])) {
            $categorized = [$filter['type']];
        }
        $categorized = array_combine($categorized, $categorized);
        $this->set(compact('categorized', 'schema'));

        return parent::beforeRender($event);
    }
}
