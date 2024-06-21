it('Google Strategy login', async () => {
  const loginMock = jest.spyOn(googleStrategy, 'login');
  await authService.login(SocialLoginProvider.GOOGLE);
  expect(loginSpy).toHaveBeenCalled();
});

it('Naver Strategy login', async () => {
  const loginMock = jest.spyOn(naverStrategy, 'login');
  await authService.login(SocialLoginProvider.NAVER);
  expect(loginSpy).toHaveBeenCalled();
});

it('Kakao Strategy login', async () => {
  const loginSpy = jest.spyOn(kakaoStrategy, 'login');
  await authService.login(SocialLoginProvider.KAKAO);
  expect(loginSpy).toHaveBeenCalled();
});

it('Apple Strategy login', async () => {
  const loginSpy = jest.spyOn(appleStrategy, 'login');
  await authService.login(SocialLoginProvider.APPLE);
  expect(loginSpy).toHaveBeenCalled();
});
