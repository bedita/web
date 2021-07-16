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

namespace App\Test\TestCase\View\Helper;

use App\View\Helper\EditorsHelper;
use Cake\Cache\Cache;
use Cake\TestSuite\TestCase;
use Cake\View\View;

/**
 * {@see \App\View\Helper\EditorsHelper} Test Case
 *
 * @coversDefaultClass \App\View\Helper\EditorsHelper
 */
class EditorsHelperTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\View\Helper\EditorsHelper
     */
    public $EditorsHelper;

    /**
     * {@inheritDoc}
     */
    public function setUp(): void
    {
        Cache::enable();
        parent::setUp();
        $request = $response = $events = null;
        $this->EditorsHelper = new EditorsHelper(new View($request, $response, $events, []));
    }

    /**
     * {@inheritDoc}
     */
    public function tearDown(): void
    {
        unset($this->EditorsHelper);
        Cache::disable();

        parent::tearDown();
    }

    /**
     * Test `list` method
     *
     * @return void
     * @covers ::list()
     */
    public function testlist(): void
    {
        // no objects in view
        $actual = $this->EditorsHelper->list();
        static::assertSame([], $actual);

        // set something by ID in objects_editors cache
        $time = time();
        $expected = [
            ['name' => 'gustavo', 'timestamp' => $time],
            ['name' => 'john doe', 'timestamp' => $time],
        ];
        $data = [
            '99' => $expected,
        ];
        Cache::write('objects_editors', json_encode($data));
        $this->EditorsHelper->getView()->set('object', ['id' => '99']);
        $actual = $this->EditorsHelper->list();
        static::assertEquals($expected, $actual);
    }
}
