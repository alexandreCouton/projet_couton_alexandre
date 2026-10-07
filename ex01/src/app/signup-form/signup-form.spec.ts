import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupForm } from './signup-form';

describe('SignupForm', () => {
  let fixture: ComponentFixture<SignupForm>;
  let el: HTMLElement;

  const input = (name: string) => el.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
  const submitBtn = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  async function type(name: string, value: string) {
    const i = input(name);
    i.value = value;
    i.dispatchEvent(new Event('input'));
    i.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function fillValid() {
    await type('login', 'jdoe');
    await type('password', 's3cret');
    await type('confirmPassword', 's3cret');
    await type('lastName', 'Doe');
    await type('firstName', 'John');
    await type('email', 'john@doe.fr');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SignupForm] }).compileComponents();
    fixture = TestBed.createComponent(SignupForm);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('expose les 6 champs avec le bon type et required', () => {
    const expected: Record<string, string> = {
      login: 'text',
      password: 'password',
      confirmPassword: 'password',
      lastName: 'text',
      firstName: 'text',
      email: 'email',
    };
    for (const [name, type] of Object.entries(expected)) {
      expect(input(name).type).toBe(type);
      expect(input(name).hasAttribute('required')).toBe(true);
    }
  });

  it('verrouille la soumission tant que le formulaire est vide', () => {
    expect(submitBtn().disabled).toBe(true);
  });

  it('déverrouille la soumission quand tout est valide', async () => {
    await fillValid();
    expect(submitBtn().disabled).toBe(false);
  });

  it('reste verrouillé si les mots de passe diffèrent', async () => {
    await fillValid();
    await type('confirmPassword', 'autre');
    expect(submitBtn().disabled).toBe(true);
    expect(el.textContent).toContain('ne correspondent pas');
  });

  it('reste verrouillé si l’email est mal formé', async () => {
    await fillValid();
    await type('email', 'pas-un-email');
    expect(submitBtn().disabled).toBe(true);
    expect(el.textContent).toContain("Format d'email invalide");
  });

  it('affiche le récapitulatif sans le mot de passe après soumission', async () => {
    await fillValid();
    submitBtn().click();
    await fixture.whenStable();
    const msg = el.querySelector('.msgbox')!;
    expect(msg.textContent).toContain('jdoe');
    expect(msg.textContent).not.toContain('s3cret');
  });
});
