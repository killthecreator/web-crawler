const errorCheck = (e: unknown) => {
  if (typeof e === "string") {
    console.log(e);
  } else if (e instanceof Error) {
    console.log(e.message);
  }
};
export default errorCheck;
