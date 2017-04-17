import { YourockPage } from './app.po';

describe('yourock App', () => {
  let page: YourockPage;

  beforeEach(() => {
    page = new YourockPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
