exports.get404 = (req, res, next) => {
  isAuthenticated: req.session.isLoggedIn
  res.status(404).render('404', {
    pageTitle: 'Page Not Found', path: '/404',
    isAuthenticated: req.session.isLoggedIn
  });
};
