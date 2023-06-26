npm run build
cp ./build ./firebase/ -r
cd firebase
firebase deploy
cd ..