helper.function <- function()
{
  return(1)
}

###
# 
###
helper.extractOIDFromCompleteOIDString <- function (oid)
{
  return(mongo.oid.from.string(str_sub(oid,10,-2)))
}

##
# 
##
helper.getUserName <- function (clientIP,createdAt)
{
  return(
    paste(str_sub(createdAt,-2),str_sub(clientIP,-3),sep = "_")
  )
}

helper.dataFrameDiff <- function(x.1,x.2,...)
{
  x.1p <- do.call("paste", x.1)
  x.2p <- do.call("paste", x.2)
  x.1[! x.1p %in% x.2p, ]
}