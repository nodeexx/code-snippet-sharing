import 'unplugin-icons/types/svelte';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace Lucia {
    type Auth = import('$lib/server/lucia/types').Auth;
    type DatabaseUserAttributes = {
      email: string;
      email_verified: boolean;
    };
    type DatabaseSessionAttributes = Record<string, never>;
  }

  namespace App {
    // interface Error {}

    interface Locals {
      authRequest: import('lucia').AuthRequest;
      authSession: import('$lib/shared/lucia/types').AuthSession | null;
      authUser: import('$lib/shared/lucia/types').AuthUser | null;
    }

    interface PageData {
      flash?: GlobalMessage;
      authUser: import('$lib/shared/lucia/types').AuthUser | null;
      doesRequireAuth?: boolean;
    }

    // interface Platform {}

    namespace Superforms {
      type Message = GlobalMessage;
    }

    type GlobalMessageType = 'error' | 'success';
    interface GlobalMessage {
      type: GlobalMessageType;
      message: string;
    }
  }
}

export {};
