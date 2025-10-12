export type RootStackParamList = {
  Welcome: undefined;
  Name: undefined;
  Username: undefined;
  Password: undefined;
  ExistingUsername: undefined;
  PinVerification: { username: string };
  NewPassword: { username: string };
  ResetSuccess: undefined;
  Login: undefined;
  Main: undefined;
  ChatScreen: { showOptions?: boolean; chatId?: string } | undefined;
  GameWaitingScreen: { roomId?: string } | undefined;
  GameSetupScreen: undefined;
  GameSessionScreen: { sessionId?: string } | undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  Search: undefined;
  PartnerProfile: { userId?: string } | undefined;
  UserProfile: { userId?: string } | undefined;
  PortalScreen: undefined;
  SentMessagesScreen: undefined;
  ReceivedMessagesScreen: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
  ChangeEmail: undefined;
  VerifyEmailOTP: undefined;
  ChangePassword: undefined;
  NotificationsScreen: undefined;
  PendingRequests: undefined;
  AccountScreen: undefined;
  AboutScreen: undefined;
};

export type PresentsStackParamList = {
  PresentsScreen: undefined;
  GameListScreen: undefined;
  CartScreen: undefined;
};

export type OursStackParamList = {
  OursScreen: undefined;
  NotesScreen: undefined;
  TimelineScreen: undefined;
  AllFavoriteMemoriesScreen: undefined;
  CartScreen: undefined;
};
