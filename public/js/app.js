window.addEventListener('load', () => {
  const Handlebars = window.Handlebars || {};
  const el = $('#app');

  // Compile Handlebar Templates
  const errorTemplate = Handlebars.compile($('#error-template').html());
  const ratesTemplate = Handlebars.compile($('#rates-template').html());
  const exchangeTemplate = Handlebars.compile($('#exchange-template').html());
  const historicalTemplate = Handlebars.compile($('#historical-template').html());

  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 5000
  });

  const showError = (error) => {
    const {title, message} = error.response.data;

    const html = errorTemplate({
      color: 'red', title, message
    });

    el.html(html);
  };

  // Router Declaration
  const router = new Router({
    mode: 'history',
    page404: (path) => {
      const html = errorTemplate({
        color: 'yellow',
        title: 'Error 404 - Page NOT Found!',
        message: `The path '/${path}' does not exist on this site`,
      });
      el.html(html);
    },
  });

  router.add('/', async () => {
    let html = ratesTemplate();
    el.html(html);

    try {
      const response = await api.get('/rates');

      const {base, date, rates} = response.data;

      // Display rates table
      html = ratesTemplate({base, date, rates});

      el.html(html);
    } catch (error) {
      showError(error);
    } finally {
      $('.loading').removeClass('loading');
    }
  });

  router.add('/exchange', () => {
    let html = exchangeTemplate;

    el.html(html);
  });

  router.add('/historical', () => {
    let html = historicalTemplate();
    el.html(html);
  });

  // Navigate app to current url
  router.navigateTo(window.location.pathname);

  // Highlight Active Menu on Refresh/Page Reload
  const link = $(`a[href$='${window.location.pathname}']`);
  link.addClass('active');

  $('a').on('click', (e) => {
    // Block browser page load
    e.preventDefault();

    // Highlight Active Menu on Click
    const target = $(e.target);
    $('.item').removeClass('active');
    target.addClass('active');

    // Navigate to clicked url
    const href = target.attr('href');
    // Get path from last '/'
    const path = href.substr(href.lastIndexOf('/'));
    router.navigateTo(path);
  });
});
