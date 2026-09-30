import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLoginMutation } from "../../features/auth/api/useLoginMutation";
import { ApiClientError, getErrorDetails, optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { Button, Callout, Field, Input } from "../../shared/ui/primitives";
import { AuthScreen } from "../auth/AuthScreen";

export function LoginPage() {
  const { t } = useLocale();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch {
      // Rendered through `errorMessage`.
    }
  }

  // Credential and rate-limit responses explain what to do; other failures use the generic copy.
  const errorMessage =
    loginMutation.error instanceof ApiClientError && [401, 429].includes(loginMutation.error.status)
      ? loginMutation.error.message
      : optionalErrorMessage(loginMutation.error, t(loginMutation.error instanceof ApiClientError ? "common.requestFailedBody" : "common.networkErrorBody"));

  return (
    <AuthScreen
      onSubmit={(event) => void handleSubmit(event)}
      switchPrompt={
        <>
          {t("authScreen.noAccount")} <Link to={routeConfig.signup.buildPath()}>{t("authScreen.signupLink")}</Link>
        </>
      }
      title={t("authScreen.loginTitle")}
    >
      <Field label={t("authScreen.email")}>
        {(control) => <Input {...control} autoComplete="email" inputMode="email" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required type="email" value={email} />}
      </Field>
      <Field label={t("authScreen.password")}>
        {(control) => <Input {...control} autoComplete="current-password" name="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />}
      </Field>
      {errorMessage ? (
        <Callout tone="danger">
          {errorMessage}
          {getErrorDetails(loginMutation.error).map((detail) => (
            <div key={detail}>{detail}</div>
          ))}
        </Callout>
      ) : null}
      <Button fullWidth loading={loginMutation.isPending} size="lg" type="submit" variant="primary">
        {t("authScreen.loginSubmit")}
      </Button>
    </AuthScreen>
  );
}
