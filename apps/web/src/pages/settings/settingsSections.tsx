import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { ProfileModel } from "../../entities/profile/model";
import { useLogout } from "../../features/auth/useLogout";
import { useUpdateProfileMutation } from "../../features/profile/api/useUpdateProfileMutation";
import { useUpdateSettingsMutation } from "../../features/profile/api/useUpdateSettingsMutation";
import { useUpdateTargetCompaniesMutation } from "../../features/profile/api/useUpdateTargetCompaniesMutation";
import { useUploadProfileImageMutation } from "../../features/profile/api/useUploadProfileImageMutation";
import { optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type AppLocale, type MessageKey } from "../../shared/i18n";
import { useTheme } from "../../shared/theme";
import type { AppTheme } from "../../shared/theme/theme";
import { Button, ButtonLink, Card, CardHeader, Callout, IconButton, Input, Segmented, Select } from "../../shared/ui/primitives";

/** One labelled row: the label and hint on the left, the control on the right. */
function Row({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="settings-row">
      <div className="settings-row__label">
        {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span>{label}</span>}
        {hint ? <p>{hint}</p> : null}
      </div>
      <div className="settings-row__control">{children}</div>
    </div>
  );
}

function SaveBar({ pending, saved, error, onSave }: { pending: boolean; saved: boolean; error: string | null; onSave?: () => void }) {
  const { t } = useLocale();
  return (
    <div className="settings-save">
      {error ? <span className="ui-tone-text--danger" role="alert">{error}</span> : saved ? <span aria-live="polite" className="settings-muted">{t("settingsPage.saved")}</span> : null}
      <Button loading={pending} onClick={onSave} type={onSave ? "button" : "submit"} variant="primary">
        {t("settingsPage.save")}
      </Button>
    </div>
  );
}

export function ProfileSection({ profile }: { profile: ProfileModel }) {
  const { t } = useLocale();
  const updateMutation = useUpdateProfileMutation();
  const uploadMutation = useUploadProfileImageMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState(profile.nickname);
  const [jobRole, setJobRole] = useState(profile.jobRole);
  const [years, setYears] = useState(profile.yearsOfExperience || "0");
  const [saved, setSaved] = useState(false);
  const error = optionalErrorMessage(updateMutation.error, t("settingsPage.saveFailed"));
  const photoError = optionalErrorMessage(uploadMutation.error, t("settingsPage.photoFailed"));
  const initial = (profile.displayName || "?").slice(0, 1).toUpperCase();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    try {
      await updateMutation.mutateAsync({ nickname: nickname.trim() || undefined, jobRole: jobRole.trim() || undefined, yearsOfExperience: Number(years) });
      setSaved(true);
    } catch {
      // Rendered through `error`.
    }
  }

  return (
    <Card aria-labelledby="settings-profile" id="profile">
      <CardHeader title={<span id="settings-profile">{t("settingsPage.profileTitle")}</span>} titleAs="h2" />
      <form onSubmit={(event) => void handleSubmit(event)}>
        <Row hint={photoError ?? t("settingsPage.photoHint")} label={t("settingsPage.photo")}>
          <div className="settings-photo">
            <span aria-hidden="true" className="settings-avatar">
              {profile.profileImageUrl ? <img alt="" src={profile.profileImageUrl} /> : initial}
            </span>
            <input
              accept="image/png,image/jpeg"
              aria-label={t("settingsPage.photo")}
              className="ui-visually-hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  uploadMutation.mutate(file);
                }
                event.target.value = "";
              }}
              ref={fileRef}
              tabIndex={-1}
              type="file"
            />
            <Button loading={uploadMutation.isPending} onClick={() => fileRef.current?.click()} size="sm">
              {t("settingsPage.changePhoto")}
            </Button>
          </div>
        </Row>
        <Row htmlFor="settings-nickname" label={t("settingsPage.nickname")}>
          <Input id="settings-nickname" onChange={(event) => setNickname(event.target.value)} value={nickname} />
        </Row>
        <Row hint={t("settingsPage.roleHint")} label={t("settingsPage.roleAndYears")}>
          <div className="settings-pair">
            <Input aria-label={t("settingsPage.role")} onChange={(event) => setJobRole(event.target.value)} placeholder={t("settingsPage.rolePlaceholder")} value={jobRole} />
            <Select aria-label={t("settingsPage.years")} onChange={(event) => setYears(event.target.value)} value={years}>
              {Array.from({ length: 21 }, (_, count) => (
                <option key={count} value={String(count)}>
                  {count === 0 ? t("settingsPage.yearsNew") : t("settingsPage.yearsOption", { count })}
                </option>
              ))}
            </Select>
          </div>
        </Row>
        <SaveBar error={error} pending={updateMutation.isPending} saved={saved} />
      </form>
    </Card>
  );
}

export function TargetCompaniesSection({ companies }: { companies: string[] }) {
  const { t } = useLocale();
  const mutation = useUpdateTargetCompaniesMutation();
  const [draft, setDraft] = useState("");
  const error = optionalErrorMessage(mutation.error, t("settingsPage.saveFailed"));

  function save(next: string[]) {
    mutation.mutate({ targetCompanies: next });
  }

  function add(event: FormEvent) {
    event.preventDefault();
    const name = draft.trim();
    if (!name || companies.some((company) => company.toLowerCase() === name.toLowerCase())) {
      setDraft("");
      return;
    }
    save([...companies, name]);
    setDraft("");
  }

  return (
    <Card aria-labelledby="settings-targets" id="target-companies">
      <CardHeader meta={t("settingsPage.targetsHint")} title={<span id="settings-targets">{t("settingsPage.targetsTitle")}</span>} titleAs="h2" />
      <div className="settings-body">
        {companies.length === 0 ? (
          <p className="settings-muted">{t("settingsPage.targetsEmpty")}</p>
        ) : (
          <ul className="settings-companies">
            {companies.map((company) => (
              <li key={company}>
                <span>{company}</span>
                <IconButton disabled={mutation.isPending} icon="close" label={t("settingsPage.remove", { name: company })} onClick={() => save(companies.filter((item) => item !== company))} />
              </li>
            ))}
          </ul>
        )}
        <form className="settings-add" onSubmit={add}>
          <Input aria-label={t("settingsPage.addCompany")} onChange={(event) => setDraft(event.target.value)} placeholder={t("settingsPage.addCompany")} value={draft} />
          <Button disabled={!draft.trim()} icon="plus" loading={mutation.isPending} type="submit">
            {t("settingsPage.add")}
          </Button>
        </form>
        {error ? <Callout tone="danger">{error}</Callout> : null}
        <ButtonLink size="sm" to={routeConfig.resumeTailor.buildPath()} variant="ghost">
          {t("settingsPage.tailorLink")}
        </ButtonLink>
      </div>
    </Card>
  );
}

export function PracticeSection({ profile }: { profile: ProfileModel }) {
  const { t } = useLocale();
  const mutation = useUpdateSettingsMutation();
  const [daily, setDaily] = useState(profile.dailyQuestionCount || "3");
  const [target, setTarget] = useState(profile.targetScoreThreshold);
  const [pass, setPass] = useState(profile.passScoreThreshold);
  const [retry, setRetry] = useState(profile.retryEnabled);
  const [saved, setSaved] = useState(false);
  const error = optionalErrorMessage(mutation.error, t("settingsPage.saveFailed"));
  const toNumber = (value: string) => (value.trim() ? Number(value) : undefined);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    try {
      await mutation.mutateAsync({ dailyQuestionCount: toNumber(daily), targetScoreThreshold: toNumber(target), passScoreThreshold: toNumber(pass), retryEnabled: retry });
      setSaved(true);
    } catch {
      // Rendered through `error`.
    }
  }

  return (
    <Card aria-labelledby="settings-practice" id="practice">
      <CardHeader title={<span id="settings-practice">{t("settingsPage.practiceTitle")}</span>} titleAs="h2" />
      <form onSubmit={(event) => void handleSubmit(event)}>
        <Row hint={t("settingsPage.dailyCountHint")} htmlFor="settings-daily" label={t("settingsPage.dailyCount")}>
          <Input id="settings-daily" max={20} min={1} onChange={(event) => setDaily(event.target.value)} type="number" value={daily} />
        </Row>
        <Row hint={t("settingsPage.targetScoreHint")} htmlFor="settings-target" label={t("settingsPage.targetScore")}>
          <Input id="settings-target" max={100} min={0} onChange={(event) => setTarget(event.target.value)} type="number" value={target} />
        </Row>
        <Row hint={t("settingsPage.passScoreHint")} htmlFor="settings-pass" label={t("settingsPage.passScore")}>
          <Input id="settings-pass" max={100} min={0} onChange={(event) => setPass(event.target.value)} type="number" value={pass} />
        </Row>
        <div className="settings-row settings-row--single">
          <label className="settings-check">
            <input checked={retry} onChange={(event) => setRetry(event.target.checked)} type="checkbox" />
            <span>{t("settingsPage.retry")}</span>
          </label>
        </div>
        <SaveBar error={error} pending={mutation.isPending} saved={saved} />
      </form>
    </Card>
  );
}

const THEME_LABELS: Record<AppTheme, MessageKey> = {
  workspace: "settingsPage.themeWorkspace",
  dark: "settingsPage.themeDark",
  dracula: "settingsPage.themeDracula",
};

export function DisplaySection() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const mutation = useUpdateSettingsMutation();
  const error = optionalErrorMessage(mutation.error, t("settingsPage.saveFailed"));

  return (
    <Card aria-labelledby="settings-display" id="display">
      <CardHeader title={<span id="settings-display">{t("settingsPage.displayTitle")}</span>} titleAs="h2" />
      <Row hint={error ?? t("settingsPage.languageHint")} label={t("settingsPage.language")}>
        <Segmented
          items={[
            { id: "ko", label: "한국어" },
            { id: "en", label: "English" },
          ]}
          label={t("settingsPage.language")}
          onChange={(next: AppLocale) => {
            setLocale(next);
            mutation.mutate({ preferredLanguage: next });
          }}
          value={locale}
        />
      </Row>
      <Row label={t("settingsPage.theme")}>
        <Segmented
          items={(Object.keys(THEME_LABELS) as AppTheme[]).map((id) => ({ id, label: t(THEME_LABELS[id]) }))}
          label={t("settingsPage.theme")}
          onChange={setTheme}
          value={theme}
        />
      </Row>
    </Card>
  );
}

export function AccountSection({ email }: { email: string }) {
  const { t } = useLocale();
  const logout = useLogout();
  return (
    <Card aria-labelledby="settings-account" id="account">
      <CardHeader title={<span id="settings-account">{t("settingsPage.accountTitle")}</span>} titleAs="h2" />
      <Row label={t("settingsPage.email")}>
        <span>{email}</span>
      </Row>
      <div className="settings-save">
        <Button icon="logout" onClick={logout} variant="danger">
          {t("settingsPage.logout")}
        </Button>
      </div>
    </Card>
  );
}
