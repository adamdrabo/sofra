import { StyleSheet, View } from 'react-native';
import { couleurs, rayon } from '../theme';

export function Carte({ style, children, ...rest }) {
  return (
    <View style={[styles.carte, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.blanc,
    borderRadius: rayon.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingHorizontal: 16
  }
});
