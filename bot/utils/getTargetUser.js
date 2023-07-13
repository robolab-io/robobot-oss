exports.getTargetUser = (act, isMenu=false) => {
  let user;
  if (isMenu) { // might not even be necessary
    user = act.targetUser // clicked user
  } else {
    let userArgument = act.options.getUser("user");
    user = userArgument 
      ? userArgument // user argument
      : act.user     // requester
  }
  return user
}
