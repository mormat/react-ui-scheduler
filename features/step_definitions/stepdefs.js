const { Given, When, Then, Before, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { By, Keys, until, Builder, Capabilities } = require('selenium-webdriver');
const { expect } = require('expect');
const css2xpath = require('css2xpath');

const driver = (function() {
    setDefaultTimeout(60 * 1000);
    
    const capabilities = Capabilities.chrome();
    capabilities.set('chromeOptions', { "w3c": false });

    return new Builder().withCapabilities(capabilities).build();
}());

const baseUrl = 'http://localhost:9000';

let config     = {};
let preScripts = [];

Before(function() {
    config = {};
    preScripts = [];
});

Given('the date today is {string}', function (string) {
    
    const timestamp = new Date(string).getTime();
    
    preScripts.push(`Date.now = function() { return ${timestamp} };`);
    
});

Given('the following events are scheduled', function (dataTable) {
    config['events'] = dataTable.hashes();
});

Given('the configuration contains:', function (dataTable) {
    config = { ...dataTable.rowsHash(), ...config }
});

When('I open the scheduler', async function () {
    
    driver.get(baseUrl + '?cucumber');
    
    const scripts = [...preScripts];
    
    const serializedConfig = serializeConfig(config);
    
    if (serializedConfig) {
        scripts.push(`scheduler.bind('#root',${serializedConfig})`);
    } else {
        scripts.push("scheduler.bind('#root')");
    }
    
    for (let script of scripts) {
        driver.executeScript(script + ';');
    }
    
});

When('I click on {string}', async function (string) {
    
    const attempts = [
        By.css(string),
        By.xpath(`//*[contains(text(), '${string}')]`),
        By.css(`[title^='${string}']`),
    ];
    
    let element;
    for (let attempt of attempts) {
        try {
            element = await driver.findElement(attempt);
        } catch (err) {
            continue;
        }
    }
    
    if (!element) {
        throw `No element matching '${string}' was found`
    }
    
    element.click();
});

When('I move the event {string} to {string}', async function (string, date) {
    
    const actions = driver.actions({async: true});
    
    const element = driver.findElement(By.xpath(
        css2xpath(`.react-ui-scheduler-event:contains('${string}')`)
    ));
    await actions.move({origin: element}).press().perform();
    
    const column = driver.findElement(By.css(`[data-datemin^='${date}']`));
    await actions.move({origin: column}).click().perform();
});


Then('I should see {string}', async function (expectedText) {
    
    const pageText =  await driver.findElement(By.tagName("body")).getText();
    
    expect(pageText).toContain(expectedText);
});

Then('I should not see {string}', async function (expectedText) {
    
    const pageText =  await driver.findElement(By.tagName("body")).getText();
    
    expect(pageText).not.toContain(expectedText);
});

Then('only the items checked below should be visible', async function (dataTable) {
    
    const pageText =  await driver.findElement(By.tagName("body")).getText();
    
    const items = dataTable.rowsHash();
    for (const [text, visible] of Object.entries(items)) {
        if (visible) {
            expect(pageText).toContain(text);
        } else {
            expect(pageText).not.toContain(text);
        }
    }
    
});


AfterAll(function() {
    driver.close();
});

function serializeConfig(config) {
    const items = Object.keys(config).map(key => {
        const value = key.startsWith('on') ? config[key] : JSON.stringify(config[key]);
        return `"${key}":${value}`;
    });
    return items.length > 0 ? '{' + items.join(',') + '}' : '';
}

/*
 *   Scenario: Display current week by default
    Given today's date is "2023-05-01"
    When I open the scheduler
    Then I should see "May nth, 2023" with "nth" between 1 and 7
    And I should see "hh:00" with "hh" between 0 and 23

 */