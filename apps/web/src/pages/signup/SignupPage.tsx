import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useSignupMutation } from "../../features/auth/api/useSignupMutation";
import { ApiClientError, getErrorDetails, optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { Button, Callout, Field, Input } from "../../shared/ui/primitives";
import { AuthScreen } from "../auth/AuthScreen";

export function SignupPage() {
  const { t } = useLocale();
  const signupMutation = useSignupMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await signupMutation.mutateAsync({ email, password });
    } catch {
      // Rendered through `errorMessage`.
    }
  }

  const errorMessage = optionalErrorMessage(signupMutation.error, t(signupMutation.error instanceof ApiClientError ? "common.requestFailedBody" : "common.networkErrorBody"));

  return (
    <AuthScreen
      onSubmit={(event) => void handleSubmit(event)}
      switchPrompt={
        <>
          {t("authScreen.haveAccount")} <Link to={routeConfig.login.buildPath()}>{t("authScreen.loginLink")}</Link>
        </>
      }
      title={t("authScreen.signupTitle")}
    >
      <Field label={t("authScreen.email")}>
        {(control) => <Input {...control} autoComplete="email" inputMode="email" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required type="email" value={email} />}
      </Field>
      <Field hint={t("authScreen.passwordHint")} label={t("authScreen.password")}>
        {(control) => <Input {...control} autoComplete="new-password" minLength={8} name="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />}
      </Field>
      {errorMessage ? (
        <Callout tone="danger">
          {errorMessage}
          {getErrorDetails(signupMutation.error).map((detail) => (
            <div key={detail}>{detail}</div>
          ))}
        </Callout>
      ) : null}
      <Button fullWidth loading={signupMutation.isPending} size="lg" type="submit" variant="primary">
        {t("authScreen.signupSubmit")}
      </Button>
    </AuthScreen>
  );
}
