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

namespace App\Test\TestCase\Core\Filter;

use App\Core\Filter\ImportFilter;
use App\Core\Result\ImportResult;
use BEdita\WebTools\ApiClientProvider;
use Cake\TestSuite\TestCase;

/**
 * Dummy filter for test
 *
 * @codeCoverageIgnore
 */
class DummyImportFilter extends ImportFilter
{
    /**
     * {@inheritDoc}
     */
    protected static $serviceName = '';

    /**
     * @inheritDoc
     *
     * @param string $filename The file name
     * @param string $filepath The file path
     * @param array $options The import options
     * @return App\Core\Result\ImportResult The result
     */
    public function import($filename, $filepath, ?array $options = []): ImportResult
    {
        return $this->createAsyncJob($filename, $filepath, $options);
    }

    /**
     * Call parent, to bypass method protection, for test purpose
     *
     * @param string $filename The file name
     * @param string $filepath The file path
     * @param array $options The options
     * @return \App\Core\Result\ImportResult
     * @throws \LogicException When method is called but missing the async job service name.
     */
    public function createAsyncJob($filename, $filepath, ?array $options = []): ImportResult
    {
        return parent::createAsyncJob($filename, $filepath, $options);
    }
}

/**
 * MyDummy import filter for test
 *
 * @codeCoverageIgnore
 */
class MyDummyImportFilter extends DummyImportFilter
{
    /**
     * {@inheritDoc}
     */
    protected static $serviceName = 'My.Dummy.Import.Service.Class';
}

/**
 * {@see \App\Core\Filter\ImportFilter} Test Case
 *
 * @coversDefaultClass \App\Core\Filter\ImportFilter
 */
class ImportFilterTest extends TestCase
{

    /**
     * Test client class
     *
     * @var \BEdita\SDK\BEditaClient
     */
    private $client = null;

    /**
     * {@inheritDoc}
     */
    public function setUp()
    {
        parent::setUp();

        $user = getenv('BEDITA_ADMIN_USR');
        $pass = getenv('BEDITA_ADMIN_PWD');
        $this->client = ApiClientProvider::getApiClient();
        $response = $this->client->authenticate($user, $pass);
        $this->client->setupTokens($response['meta']);
    }

    /**
     * Data provider for `testCreateAsyncJob()`
     *
     * @return array
     */
    public function createAsyncJobProvider()
    {
        $result = new ImportResult();
        $filename = 'import.csv';
        $asyncJobId = '?'; // not possible to get it... ignoring
        $result->addMessage('info', (string)__('Job {0} to import file "{1}" scheduled.', $asyncJobId, $filename)); // almost the same info set by ImportFilter on createAsyncJob

        return [
            'logic exception: service name not defined' => [
                new DummyImportFilter(),
                '',
                '',
                [],
                new \LogicException('Cannot create async job without service name defined.'),
            ],
            'job to import file scheduled' => [
                new MyDummyImportFilter(),
                $filename,
                sprintf('%s/tests/files/%s', getcwd(), $filename),
                [],
                $result,
            ],
        ];
    }

    /**
     * Test create async job
     *
     * @param \App\Core\Filter\ImportFilter $importFilter The import filter
     * @param string $filename The file name
     * @param string $filepath The file path
     * @param array $options The async job options
     * @param \LogicException|\App\Core\Result\ImportResult $expected The result expected
     * @return void
     *
     * @dataProvider createAsyncJobProvider
     * @covers ::createAsyncJob()
     */
    public function testCreateAsyncJob($importFilter, $filename, $filepath, $options, $expected)
    {
        if ($expected instanceof \LogicException) {
            $this->expectException(get_class($expected));
            $this->expectExceptionCode($expected->getCode());
            $this->expectExceptionMessage($expected->getMessage());
        }
        $actual = $importFilter->createAsyncJob($filename, $filepath, $options);
        static::assertEquals(get_class($expected), get_class($actual));
        static::assertNotEmpty($actual->info);
    }
}
