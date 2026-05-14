import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import Icon from '@/components/ui/icon';

interface FormErrors {
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Password tab
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // SMS tab
  const [phone, setPhone] = useState('+7');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v: string) => /^\+7\d{10}$/.test(v.replace(/\s|\(|\)|-/g, ''));

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!email) newErrors.email = 'Введите email';
    else if (!validateEmail(email)) newErrors.email = 'Некорректный email';
    if (!password) newErrors.password = 'Введите пароль';
    else if (password.length < 4) newErrors.password = 'Минимум 4 символа';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem('sk_token', 'demo-token-' + Date.now());
    if (remember) localStorage.setItem('sk_remember', '1');
    toast.success('Вход выполнен успешно');
    setLoading(false);
    navigate('/');
  };

  const handleSSO = async () => {
    setLoading(true);
    toast.info('Перенаправление на Keycloak...');
    await new Promise((r) => setTimeout(r, 1000));
    localStorage.setItem('sk_token', 'sso-token-' + Date.now());
    setLoading(false);
    navigate('/');
  };

  const handleSendOtp = async () => {
    const newErrors: FormErrors = {};
    if (!validatePhone(phone)) newErrors.phone = 'Введите телефон в формате +7XXXXXXXXXX';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setOtpSent(true);
    setOtpTimer(60);
    toast.success('Код отправлен на ' + phone);
    setLoading(false);

    const interval = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    const newErrors: FormErrors = {};
    if (otp.length !== 4) newErrors.otp = 'Введите 4-значный код';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    localStorage.setItem('sk_token', 'sms-token-' + Date.now());
    toast.success('Вход выполнен успешно');
    setLoading(false);
    navigate('/');
  };

  const handleDemoLogin = () => {
    localStorage.setItem('sk_token', 'demo-token-' + Date.now());
    toast.success('Демо-вход выполнен');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Login Card */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 shadow-lg">
                  <Icon name="Wind" className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">HVAC ERP</h1>
                <p className="text-sm text-gray-500 mt-1">Сервис Климат</p>
              </div>

              <Tabs defaultValue="password" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="password" className="text-xs">
                    Вход по паролю
                  </TabsTrigger>
                  <TabsTrigger value="sso" className="text-xs">
                    SSO Keycloak
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="text-xs">
                    По SMS
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Password */}
                <TabsContent value="password">
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative mt-1">
                        <Icon
                          name="Mail"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@servisklimat.ru"
                          className="pl-9"
                          autoComplete="email"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <Icon name="AlertCircle" className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password">Пароль</Label>
                      <div className="relative mt-1">
                        <Icon
                          name="Lock"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-9 pr-9"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <Icon name={showPassword ? 'EyeOff' : 'Eye'} className="w-4 h-4" />
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <Icon name="AlertCircle" className="w-3 h-3" />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          checked={remember}
                          onCheckedChange={(c) => setRemember(c === true)}
                        />
                        <Label htmlFor="remember" className="text-sm cursor-pointer">
                          Запомнить меня
                        </Label>
                      </div>
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info('Письмо для восстановления отправлено');
                        }}
                      >
                        Забыли пароль?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                          Вход...
                        </>
                      ) : (
                        <>
                          <Icon name="LogIn" className="w-4 h-4 mr-2" />
                          Войти
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Tab 2: SSO */}
                <TabsContent value="sso">
                  <div className="space-y-4 py-4">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                        <Icon name="ShieldCheck" className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Войти через корпоративный аккаунт Keycloak
                      </p>
                      <p className="text-xs text-gray-400">
                        Будете перенаправлены на страницу авторизации
                      </p>
                    </div>

                    <Button
                      onClick={handleSSO}
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      {loading ? (
                        <Icon name="Loader2" className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Icon name="KeyRound" className="w-5 h-5 mr-2" />
                      )}
                      Войти через Keycloak
                    </Button>

                    <div className="text-xs text-center text-gray-400 pt-2">
                      Realm: servisklimat · Client: hvac-erp-web
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: SMS */}
                <TabsContent value="sms">
                  <div className="space-y-4">
                    {!otpSent ? (
                      <>
                        <div>
                          <Label htmlFor="phone">Номер телефона</Label>
                          <div className="relative mt-1">
                            <Icon
                              name="Phone"
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            />
                            <Input
                              id="phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+79001234567"
                              className="pl-9"
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <Icon name="AlertCircle" className="w-3 h-3" />
                              {errors.phone}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Мы отправим SMS с кодом подтверждения
                          </p>
                        </div>

                        <Button
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? (
                            <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Icon name="MessageSquare" className="w-4 h-4 mr-2" />
                          )}
                          Получить код
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            Код отправлен на <span className="font-medium">{phone}</span>
                          </p>
                        </div>

                        <div className="flex justify-center">
                          <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>

                        {errors.otp && (
                          <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
                            <Icon name="AlertCircle" className="w-3 h-3" />
                            {errors.otp}
                          </p>
                        )}

                        <Button
                          onClick={handleVerifyOtp}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? (
                            <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Icon name="Check" className="w-4 h-4 mr-2" />
                          )}
                          Подтвердить
                        </Button>

                        <div className="text-center">
                          {otpTimer > 0 ? (
                            <p className="text-xs text-gray-400">
                              Повторно отправить код через {otpTimer}с
                            </p>
                          ) : (
                            <button
                              onClick={() => {
                                setOtpSent(false);
                                setOtp('');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Отправить код повторно
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">или</span>
                </div>
              </div>

              <Button variant="outline" onClick={handleDemoLogin} className="w-full">
                <Icon name="Sparkles" className="w-4 h-4 mr-2 text-amber-500" />
                Demo вход
              </Button>

              <div className="mt-6 text-center text-xs text-gray-400">
                © 2026 АСУ СЦ «Сервис Климат». Версия 4.0
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Value Props */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Управление 100+ сервисными центрами HVAC по всей России
            </h2>
            <p className="text-gray-600 text-lg">
              Единая платформа для диспетчеризации, склада, финансов и AI-планирования
              визитов инженеров.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: 'ClipboardList', value: '5000+', label: 'нарядов в день' },
                { icon: 'Target', value: '95%', label: 'SLA выполнено' },
                { icon: 'Brain', value: 'AI', label: 'диспетчер 24/7' },
                { icon: 'Smartphone', value: 'Mobile', label: 'First подход' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/70 backdrop-blur rounded-xl p-4 border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon name={stat.icon} className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl p-5 border border-blue-100">
              <div className="flex items-start gap-3">
                <Icon name="Quote" className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 italic">
                    «За год использования НПС вырос с 42 до 76, а количество визитов на
                    одного инженера увеличилось на 23%»
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    — А. Петров, директор СЦ «КлиматПро», Москва
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
                Нам доверяют
              </p>
              <div className="grid grid-cols-4 gap-3">
                {['Daikin', 'Mitsubishi', 'LG', 'Samsung'].map((brand) => (
                  <div
                    key={brand}
                    className="bg-white/80 rounded-lg h-12 flex items-center justify-center border border-blue-100 text-sm font-semibold text-gray-500"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
