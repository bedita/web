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
namespace App\View\Helper;

use Cake\Cache\Cache;
use Cake\Utility\Hash;
use Cake\View\Helper;

/**
 * Helper for editors
 */
class EditorsHelper extends Helper
{
    /**
     * Get list of object editors.
     *
     * @return array
     */
    public function list(): array
    {
        $id = (string)Hash::get((array)$this->getView()->get('object'), 'id');
        $cached = (string)Cache::read('objects_editors', 'default');
        $objectsEditors = (array)json_decode($cached, true);
        if (array_key_exists($id, $objectsEditors)) {
            return $objectsEditors[$id];
        }

        return [];
    }
}
