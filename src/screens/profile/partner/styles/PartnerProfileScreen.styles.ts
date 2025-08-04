import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#23243a",
    paddingHorizontal: 16,
  },
  portalIcon: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 100,
    backgroundColor: "#23243a",
    borderRadius: 20,
    padding: 4,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 0,
  },
  avatarWrapper: {
    marginRight: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderColor: "#e03487",
    backgroundColor: "#444",
  },
  infoWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 0,
  },
  username: {
    fontSize: 16,
    color: "#e03487",
    marginBottom: 8,
    marginLeft: 4,
  },
  bio: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#393a4a",
    marginVertical: 0,
    opacity: 1,
  },
  partnerRow: {
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  distanceText: {
    fontWeight: "800",
    color: "#b0b3c6",
  },
  apartText: {
    color: "#b0b3c6",
    fontWeight: "500"
  },
  partnerText: {
    color: "#b0b3c6",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  partnerName: {
    color: "rgb(155, 158, 180)",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    backgroundColor: "#e02222",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default styles;
