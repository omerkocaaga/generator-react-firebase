import <%= camelName %>Unwrapped from './index';

const <%= camelName %> = functionsTest.wrap(<%= camelName %>Unwrapped);

describe('<%= camelName %> PubSub Cloud Function (PubSub:<%= eventType %>)', () => {
  after(async () => {
    functionsTest.cleanup();
  });

  it('handles event', async () => {
    await <%= camelName %>({});
    // TODO: Switch this to a real assertion which confirms functionality
    expect(null).<% if (jestTesting) { %>toEqual(null)<% } else { %>to.be.null<% } %>;
  });
});
