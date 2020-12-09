<?php
/**
 * BEdita, API-first content management framework
 * Copyright 2020 ChannelWeb Srl, Chialab Srl
 *
 * This file is part of BEdita: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE.LGPL or <http://gnu.org/licenses/lgpl-3.0.html> for more details.
 */

namespace App\Test\TestCase\View\Helper;

use App\Application;
use App\Test\TestCase\Controller\AppControllerTest;
use App\View\Helper\LinkHelper;
use Cake\Core\Configure;
use Cake\Http\ServerRequest;
use Cake\TestSuite\TestCase;
use Cake\View\View;

/**
 * {@see \App\View\Helper\LinkHelper} Test Case
 *
 * @coversDefaultClass \App\View\Helper\LinkHelper
 */
class LinkHelperTest extends TestCase
{

    /**
     * Data provider for `testFromAPI` test case.
     *
     * @return array
     */
    public function fromAPIProvider(): array
    {
        return [
            'empty url' => [
                '', // apiBaseUrl
                '', // webBaseUrl
                '', // apiUrl
                '', // expected
            ],
            'not empty url' => [
                '/api/objects', // apiBaseUrl
                '/objects', // webBaseUrl
                'https://www.gustavo.com/api/objects', // apiUrl
                'https://www.gustavo.com/objects', // expected
            ],
        ];
    }

    /**
     * Test `fromAPI`
     *
     * @param string $apiBaseUrl The api base url
     * @param string $webBaseUrl The web base url
     * @param string $apiUrl The api url
     * @param string $expected The url expected
     * @return void
     *
     * @dataProvider fromAPIProvider()
     * @covers ::fromAPI()
     */
    public function testFromAPI($apiBaseUrl, $webBaseUrl, $apiUrl, $expected): void
    {
        $link = new LinkHelper(new View(null, null, null, []));
        $link->apiBaseUrl = $apiBaseUrl;
        $link->webBaseUrl = $webBaseUrl;
        $result = $link->fromAPI($apiUrl);
        $this->expectOutputString($expected);
    }

    /**
     * Data provider for `sortUrl` test case.
     *
     * @return array
     */
    public function sortUrlProvider(): array
    {
        $request = new ServerRequest([
            'environment' => [
                'REQUEST_METHOD' => 'GET',
            ],
            'params' => [
                'object_type' => 'documents',
            ],
        ]);

        return [
            'sort field' => [
                $request->withQueryParams(['page' => 2]), // request
                'title', // field
                false, // reset page
                'http://localhost/?page=2&sort=title', // expected
            ],
            'sort -field' => [
                $request->withQueryParams(['page' => 3]), // request
                '-title', // field
                false, // reset page
                'http://localhost/?page=3&sort=-title', // expected
            ],
            'sort and reset page' => [
                $request->withQueryParams(['page' => 4]), // request
                'title', // field
                true, // reset page
                'http://localhost/?page=1&sort=title', // expected
            ],
        ];
    }

    /**
     * Test `sortUrl`
     *
     * @param \Cake\Http\ServerRequest $request The server request
     * @param string $field The field to sort by
     * @param bool $resetPage The reset page flag
     * @param string $expected The expected output
     * @return void
     * @dataProvider sortUrlProvider()
     * @covers ::sortUrl
     * @covers ::replaceQueryParams
     */
    public function testSortUrl(ServerRequest $request, string $field, bool $resetPage, string $expected): void
    {
        $link = new LinkHelper(new View($request, null, null, []));
        $actual = $link->sortUrl($field, $resetPage);
        static::assertEquals($expected, $actual);
    }

    /**
     * Data provider for `sortClass` test case.
     *
     * @return array
     */
    public function sortClassProvider(): array
    {
        $request = new ServerRequest([
            'environment' => [
                'REQUEST_METHOD' => 'GET',
            ],
            'params' => [
                'object_type' => 'documents',
            ],
        ]);

        return [
            'no sort' => [
                $request->withQueryParams([]), // request
                'title', // field
                '', // expected
            ],
            'sort by not managed field' => [
                $request->withQueryParams(['sort' => 'dummy']), // request
                'title', // field
                '', // expected
            ],
            'sort down' => [
                $request->withQueryParams(['sort' => 'title']), // request
                'title', // field
                'sort down', // expected
            ],
            'sort up' => [
                $request->withQueryParams(['sort' => '-title']), // request
                'title', // field
                'sort up', // expected
            ],
        ];
    }

    /**
     * Test `sortClass`
     *
     * @param \Cake\Http\ServerRequest $request The server request
     * @param string $field The field to sort by
     * @param string $expected The expected output
     * @return void
     * @dataProvider sortClassProvider()
     * @covers ::sortClass
     */
    public function testSortClass(ServerRequest $request, string $field, string $expected): void
    {
        $link = new LinkHelper(new View($request, null, null, []));
        $actual = $link->sortClass($field);
        static::assertEquals($expected, $actual);
    }

    /**
     * Data provider for `page` test case.
     *
     * @return array
     */
    public function pageProvider(): array
    {
        return [
            'zero' => [0],
            'non zero' => [999],
        ];
    }

    /**
     * Test `page` method
     *
     * @param int $page The page number
     * @return void
     * @dataProvider pageProvider()
     * @covers ::page
     * @covers ::replaceQueryParams
     */
    public function testPage(int $page): void
    {
        $request = new ServerRequest([
            'environment' => [
                'REQUEST_METHOD' => 'GET',
            ],
            'params' => [
                'object_type' => 'documents',
            ],
        ]);
        $link = new LinkHelper(new View($request, null, null, []));
        // call private method using AppControllerTest->invokeMethod
        $test = new AppControllerTest(new ServerRequest());
        $expected = $test->invokeMethod($link, 'replaceQueryParams', [compact('page')]);
        $this->expectOutputString($expected);
        // call page method
        $link->page($page);
    }

    /**
     * Data provider for `pageSize` test case.
     *
     * @return array
     */
    public function pageSizeProvider(): array
    {
        return [
            '1' => [1],
            '10' => [10],
            '100' => [100],
            '500' => [500],
        ];
    }

    /**
     * Test `pageSize` method
     *
     * @param int $pageSize The page size
     * @return void
     * @dataProvider pageSizeProvider()
     * @covers ::pageSize
     * @covers ::replaceQueryParams
     */
    public function testPageSize(int $pageSize): void
    {
        $request = new ServerRequest([
            'environment' => [
                'REQUEST_METHOD' => 'GET',
            ],
            'params' => [
                'object_type' => 'documents',
            ],
        ]);
        $link = new LinkHelper(new View($request, null, null, []));
        // call private method using AppControllerTest->invokeMethod
        $test = new AppControllerTest(new ServerRequest());
        $expected = $test->invokeMethod($link, 'replaceQueryParams', [['page_size' => $pageSize]]);
        $this->expectOutputString($expected);
        // call page method
        $link->pageSize($pageSize);
    }

    /**
     * Data provider for `here` test case.
     *
     * @return array
     */
    public function hereProvider(): array
    {
        $request = new ServerRequest([
            'environment' => [
                'REQUEST_METHOD' => 'GET',
            ],
            'params' => [
                'object_type' => 'documents',
            ],
        ]);

        return [
            'empty query' => [
                $request->withQueryParams([]), // request
                [], // options
                '/', // expected
            ],
            'options no-query' => [
                $request->withQueryParams(['some' => 'thing']), // request
                ['no-query' => true], // options
                '/', // expected
            ],
            'options exclude query page, empty q' => [
                $request->withQueryParams(['page' => 2]), // request
                ['exclude' => 'page'], // options
                '/', // expected
            ],
            'options exclude query page, not empty q' => [
                $request->withQueryParams(['page' => 2, 'sort' => '-id']), // request
                ['exclude' => 'page'], // options
                '/?sort=-id', // expected
            ],
        ];
    }

    /**
     * Test `here` method
     *
     * @param \Cake\Http\ServerRequest $request The server request
     * @param array $options The options
     * @param string $expected The expected url string
     * @return void
     * @dataProvider hereProvider()
     * @covers ::here
     */
    public function testHere(ServerRequest $request, array $options, string $expected): void
    {
        $link = new LinkHelper(new View($request, null, null, []));
        $actual = $link->here($options);
        static::assertEquals($expected, $actual);
    }

    /**
     * Data provider for `replaceQueryParams` test case.
     *
     * @return array
     */
    public function replaceQueryParamsProvider(): array
    {
        $request = new ServerRequest([
            'environment' => [
                'REQUEST_METHOD' => 'GET',
            ],
            'params' => [
                'object_type' => 'documents',
            ],
        ]);

        return [
            'empty params' => [
                $request->withQueryParams([]), // request
                [], // query params
                'http://localhost/', // expected
            ],
            'some params' => [
                $request->withQueryParams(['q' => 'search']), // request
                ['q' => 'search'], // query params
                'http://localhost/?q=search', // expected
            ],
        ];
    }

    /**
     * Test `replaceQueryParams` method
     *
     * @param \Cake\Http\ServerRequest $request The server request
     * @param array $queryParams The query params
     * @param string $expected The expected url string
     * @return void
     * @dataProvider replaceQueryParamsProvider()
     * @covers ::replaceQueryParams
     */
    public function testReplaceQueryParams(ServerRequest $request, array $queryParams, string $expected): void
    {
        $link = new LinkHelper(new View($request, null, null, []));
        // call private method using AppControllerTest->invokeMethod
        $test = new AppControllerTest(new ServerRequest());
        $actual = $test->invokeMethod($link, 'replaceQueryParams', [$queryParams]);
        static::assertEquals($expected, $actual);
    }

    /**
     * Test `pluginsBundle`
     *
     * @return void
     * @covers ::pluginsBundle
     */
    public function testPluginsBundle(): void
    {
        // load plugins from config for test
        $app = new Application(CONFIG);
        $app->bootstrap();
        $debug = Configure::read('debug');
        $pluginsConfig = [
            'DebugKit' => ['debugOnly' => true],
            'Bake' => ['debugOnly' => false],
        ];
        Configure::write('Plugins', $pluginsConfig);
        $app->loadPluginsFromConfig();
        // do test
        $this->expectOutputString('');
        $link = new LinkHelper(new View(new ServerRequest(), null, null, []));
        $link->pluginsBundle();
    }

    /**
     * Test `pluginAsset`
     *
     * @return void
     * @covers ::pluginAsset
     */
    public function testPluginAsset(): void
    {
        // load plugins from config for test
        $app = new Application(CONFIG);
        $app->bootstrap();
        $debug = Configure::read('debug');
        $pluginsConfig = [
            'DebugKit' => ['debugOnly' => true],
        ];
        Configure::write('Plugins', $pluginsConfig);
        $app->loadPluginsFromConfig();
        // do test
        $link = new LinkHelper(new View(new ServerRequest(), null, null, []));
        $actual = $link->pluginAsset('DebugKit', 'css');
        static::assertEquals('', $actual);
        $actual = $link->pluginAsset('DebugKit', 'js');
        static::assertEquals('', $actual);
    }

    /**
     * Data provider for `testObjectNav` test case.
     *
     * @return array
     */
    public function objectNavProvider(): array
    {
        return [
            'empty' => [
                [], // $data
                '<div class="listobjnav">‹›<div>0 / 0</div></div>', // $expected
            ],
            'only next' => [
                [
                    'next' => 2,
                    'index' => 1,
                    'total' => 10,
                ], // $data
                '<div class="listobjnav">‹<a href="/view/2">›</a><div>1 / 10</div></div>', // $expected
            ],
            'only prev' => [
                [
                    'prev' => 9,
                    'index' => 10,
                    'total' => 10,
                ], // $data
                '<div class="listobjnav"><a href="/view/9">‹</a>›<div>10 / 10</div></div>', // $expected
            ],
            'full' => [
                [
                    'prev' => 4,
                    'next' => 6,
                    'index' => 5,
                    'total' => 10,
                ], // $data
                '<div class="listobjnav"><a href="/view/4">‹</a><a href="/view/6">›</a><div>5 / 10</div></div>', // $expected
            ],
        ];
    }

    /**
     * Test `objectNav`
     *
     * @dataProvider objectNavProvider()
     * @covers ::objectNav()
     */
    public function testObjectNav($data, $expected): void
    {
        $request = $response = $events = null;
        $link = new LinkHelper(new View($request, $response, $events, $data));
        $result = $link->objectNav($data);
        static::assertSame($expected, $result);
    }
}
